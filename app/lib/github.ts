import { WORK_DIR } from '~/utils/constants';
import type { FileMap } from './stores/files';

interface GithubCreateRepoResponse {
  full_name: string;
  owner: { login: string };
  name: string;
  default_branch: string;
  html_url: string;
}

interface GithubUserResponse {
  login: string;
}

interface PublishProjectOptions {
  token: string;
  repo: string;
  isPrivate: boolean;
  files: FileMap;
}

interface SyncProjectOptions {
  token: string;
  repo: string;
}

interface GithubBlobResponse {
  content: string;
  encoding: string;
}

interface GithubTreeNode {
  path: string;
  type: 'blob' | 'tree' | string;
  sha: string;
}

interface GithubTreeResponse {
  tree: GithubTreeNode[];
}

interface GithubRepoResponse {
  full_name: string;
  owner: { login: string };
  name: string;
  default_branch: string;
  html_url: string;
}

function normalizeRepoName(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9._-]/g, '-')
    .replace(/-+/g, '-');
}

function parseRepoRef(repoRef: string) {
  const trimmed = repoRef.trim();

  if (trimmed.includes('/')) {
    const [owner, ...rest] = trimmed.split('/');
    const repo = rest.join('/').trim();

    if (!owner || !repo) {
      throw new Error('Repository must be in format owner/repo or repo');
    }

    return {
      owner: owner.trim(),
      repo: repo.trim(),
    };
  }

  return {
    owner: null,
    repo: normalizeRepoName(trimmed),
  };
}

function toRelativePath(filePath: string) {
  return filePath.startsWith(`${WORK_DIR}/`) ? filePath.slice(WORK_DIR.length + 1) : filePath;
}

function isPublishablePath(path: string) {
  return path.length > 0 && !path.includes('/node_modules/') && !path.startsWith('node_modules/');
}

function toBase64(content: string) {
  return btoa(unescape(encodeURIComponent(content)));
}

function fromBase64(content: string) {
  return decodeURIComponent(escape(atob(content.replace(/\n/g, ''))));
}

function encodeGithubPath(path: string) {
  return path
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');
}

async function githubFetch<T>(path: string, token: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`https://api.github.com${path}`, {
    ...init,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
      ...(init.headers ?? {}),
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`GitHub API error (${response.status}): ${text}`);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json() as Promise<T>;
}

async function getCurrentUser(token: string) {
  return githubFetch<GithubUserResponse>('/user', token);
}

async function createOrGetRepo(token: string, repoName: string, isPrivate: boolean) {
  try {
    const created = await githubFetch<GithubCreateRepoResponse>('/user/repos', token, {
      method: 'POST',
      body: JSON.stringify({
        name: repoName,
        private: isPrivate,
        auto_init: true,
        description: 'Generated with Hima',
      }),
    });

    return created;
  } catch (error) {
    const message = error instanceof Error ? error.message : '';

    if (!message.includes('422')) {
      throw error;
    }

    const user = await getCurrentUser(token);

    return githubFetch<GithubCreateRepoResponse>(`/repos/${user.login}/${repoName}`, token);
  }
}

async function getRepo(token: string, owner: string, repo: string) {
  return githubFetch<GithubRepoResponse>(`/repos/${owner}/${repo}`, token);
}

async function upsertFile({
  token,
  owner,
  repo,
  branch,
  path,
  content,
}: {
  token: string;
  owner: string;
  repo: string;
  branch: string;
  path: string;
  content: string;
}) {
  let existingSha: string | undefined;

  try {
    const existing = await githubFetch<{ sha: string }>(
      `/repos/${owner}/${repo}/contents/${encodeGithubPath(path)}?ref=${branch}`,
      token,
    );
    existingSha = existing.sha;
  } catch {
    existingSha = undefined;
  }

  await githubFetch(`/repos/${owner}/${repo}/contents/${encodeGithubPath(path)}`, token, {
    method: 'PUT',
    body: JSON.stringify({
      message: `chore: update ${path}`,
      content: toBase64(content),
      branch,
      sha: existingSha,
    }),
  });
}

export async function publishProjectToGithub({ token, repo, isPrivate, files }: PublishProjectOptions) {
  const parsed = parseRepoRef(repo || 'hima-app');
  const normalizedRepo = normalizeRepoName(parsed.repo || 'hima-app');

  if (!normalizedRepo) {
    throw new Error('Repository name is required');
  }

  let repository: GithubRepoResponse;

  if (parsed.owner) {
    repository = await getRepo(token, parsed.owner, normalizedRepo);
  } else {
    repository = await createOrGetRepo(token, normalizedRepo, isPrivate);
  }

  const entries = Object.entries(files)
    .filter(([, dirent]) => dirent?.type === 'file' && !dirent.isBinary)
    .map(([path, dirent]) => ({
      path: toRelativePath(path),
      content: dirent?.type === 'file' ? dirent.content : '',
    }))
    .filter((file) => isPublishablePath(file.path));

  for (const file of entries) {
    await upsertFile({
      token,
      owner: repository.owner.login,
      repo: repository.name,
      branch: repository.default_branch,
      path: file.path,
      content: file.content,
    });
  }

  return {
    repoFullName: repository.full_name,
    repoUrl: repository.html_url,
    filesPushed: entries.length,
  };
}

export async function syncProjectFromGithub({ token, repo }: SyncProjectOptions) {
  const parsed = parseRepoRef(repo);

  if (!parsed.owner) {
    const user = await getCurrentUser(token);
    parsed.owner = user.login;
  }

  const repository = await getRepo(token, parsed.owner, parsed.repo);
  const tree = await githubFetch<GithubTreeResponse>(
    `/repos/${parsed.owner}/${parsed.repo}/git/trees/${repository.default_branch}?recursive=1`,
    token,
  );

  const blobs = tree.tree.filter((node) => node.type === 'blob' && isPublishablePath(node.path));
  const files: Array<{ path: string; content: string }> = [];

  for (const blob of blobs) {
    const blobData = await githubFetch<GithubBlobResponse>(
      `/repos/${parsed.owner}/${parsed.repo}/git/blobs/${blob.sha}`,
      token,
    );

    if (blobData.encoding !== 'base64') {
      continue;
    }

    try {
      files.push({
        path: blob.path,
        content: fromBase64(blobData.content),
      });
    } catch {
      // ignore binary or undecodable content
    }
  }

  return {
    repoFullName: repository.full_name,
    repoUrl: repository.html_url,
    files,
  };
}
