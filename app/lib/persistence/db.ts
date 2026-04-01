import type { Message } from 'ai';
import { createScopedLogger } from '~/utils/logger';
import type { ChatHistoryItem } from './useChatHistory';

const logger = createScopedLogger('ChatHistory');

export interface IProviderSetting {
  name: string;
  apiKey: string;
  enabled: boolean;
}

export interface CloudSettings {
  supabaseUrl: string;
  supabaseAnonKey: string;
  supabaseServiceRoleKey: string;
  clerkPublishableKey: string;
  clerkSecretKey: string;
  mcpServerUrl: string;
  mcpApiKey: string;
  netlifyToken: string;
  githubToken: string;
  githubRepo: string;
  githubPrivate: boolean;
}

export interface UserSettings {
  providers: IProviderSetting[];
  selectedProvider: string;
  selectedModel: string;
  cloud?: CloudSettings;
}

const DEFAULT_SETTINGS: UserSettings = {
  providers: [
    { name: 'Anthropic', apiKey: '', enabled: true },
    { name: 'OpenAI', apiKey: '', enabled: false },
    { name: 'Google', apiKey: '', enabled: false },
  ],
  selectedProvider: 'Anthropic',
  selectedModel: 'claude-sonnet-4-6',
  cloud: {
    supabaseUrl: '',
    supabaseAnonKey: '',
    supabaseServiceRoleKey: '',
    clerkPublishableKey: '',
    clerkSecretKey: '',
    mcpServerUrl: '',
    mcpApiKey: '',
    netlifyToken: '',
    githubToken: '',
    githubRepo: 'hima-app',
    githubPrivate: true,
  },
};

// this is used at the top level and never rejects
export async function openDatabase(): Promise<IDBDatabase | undefined> {
  return new Promise((resolve) => {
    // bumped to version 3 to rebuild the urlId index without the unique constraint
    const request = indexedDB.open('boltHistory', 3);

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains('chats')) {
        const store = db.createObjectStore('chats', { keyPath: 'id' });
        store.createIndex('id', 'id', { unique: true });
        store.createIndex('urlId', 'urlId', { unique: false });
      }

      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'key' });
      }
    };

    request.onsuccess = (event: Event) => {
      resolve((event.target as IDBOpenDBRequest).result);
    };

    request.onerror = (event: Event) => {
      resolve(undefined);
      logger.error((event.target as IDBOpenDBRequest).error);
    };
  });
}

export async function getAll(db: IDBDatabase): Promise<ChatHistoryItem[]> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('chats', 'readonly');
    const store = transaction.objectStore('chats');
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result as ChatHistoryItem[]);
    request.onerror = () => reject(request.error);
  });
}

export async function setMessages(
  db: IDBDatabase,
  id: string,
  messages: Message[],
  urlId?: string,
  description?: string,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('chats', 'readwrite');
    const store = transaction.objectStore('chats');

    const request = store.put({
      id,
      messages,
      urlId,
      description,
      timestamp: new Date().toISOString(),
    });

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function getMessages(db: IDBDatabase, id: string): Promise<ChatHistoryItem> {
  return (await getMessagesById(db, id)) || (await getMessagesByUrlId(db, id));
}

export async function getMessagesByUrlId(db: IDBDatabase, id: string): Promise<ChatHistoryItem> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('chats', 'readonly');
    const store = transaction.objectStore('chats');
    const index = store.index('urlId');
    const request = index.get(id);

    request.onsuccess = () => resolve(request.result as ChatHistoryItem);
    request.onerror = () => reject(request.error);
  });
}

export async function getMessagesById(db: IDBDatabase, id: string): Promise<ChatHistoryItem> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('chats', 'readonly');
    const store = transaction.objectStore('chats');
    const request = store.get(id);

    request.onsuccess = () => resolve(request.result as ChatHistoryItem);
    request.onerror = () => reject(request.error);
  });
}

export async function deleteById(db: IDBDatabase, id: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('chats', 'readwrite');
    const store = transaction.objectStore('chats');
    const request = store.delete(id);

    request.onsuccess = () => resolve(undefined);
    request.onerror = () => reject(request.error);
  });
}

export async function getNextId(db: IDBDatabase): Promise<string> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('chats', 'readonly');
    const store = transaction.objectStore('chats');
    const request = store.getAllKeys();

    request.onsuccess = () => {
      const highestId = request.result.reduce((cur, acc) => Math.max(+cur, +acc), 0);
      resolve(String(+highestId + 1));
    };

    request.onerror = () => reject(request.error);
  });
}

export async function getUrlId(db: IDBDatabase, id: string): Promise<string> {
  const idList = await getUrlIds(db);

  if (!idList.includes(id)) {
    return id;
  } else {
    let i = 2;

    while (idList.includes(`${id}-${i}`)) {
      i++;
    }

    return `${id}-${i}`;
  }
}

async function getUrlIds(db: IDBDatabase): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('chats', 'readonly');
    const store = transaction.objectStore('chats');
    const idList: string[] = [];

    const request = store.openCursor();

    request.onsuccess = (event: Event) => {
      const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;

      if (cursor) {
        idList.push(cursor.value.urlId);
        cursor.continue();
      } else {
        resolve(idList);
      }
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

// ==================== NEW FEATURES ====================

export async function updateChatDescription(db: IDBDatabase, id: string, newDescription: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('chats', 'readwrite');
    const store = transaction.objectStore('chats');
    const request = store.get(id);

    request.onsuccess = () => {
      const chat = request.result;

      if (chat) {
        chat.description = newDescription;
        chat.timestamp = new Date().toISOString();

        const putRequest = store.put(chat);
        putRequest.onsuccess = () => resolve();
        putRequest.onerror = () => reject(putRequest.error);
      } else {
        reject(new Error('Chat not found'));
      }
    };
    request.onerror = () => reject(request.error);
  });
}

export async function duplicateChat(db: IDBDatabase, id: string): Promise<string> {
  const original = await getMessagesById(db, id);

  if (!original) {
    throw new Error('Chat not found');
  }

  const nextId = await getNextId(db);
  const newUrlId = original.urlId ? await getUrlId(db, `${original.urlId}-copy`) : undefined;

  await setMessages(db, nextId, [...original.messages], newUrlId, `${original.description || 'Chat'} (copy)`);

  return newUrlId || nextId;
}

export async function exportAllChats(db: IDBDatabase): Promise<string> {
  const all = await getAll(db);
  return JSON.stringify(all, null, 2);
}

export async function importChats(db: IDBDatabase, jsonString: string): Promise<number> {
  const chats: ChatHistoryItem[] = JSON.parse(jsonString);

  if (!Array.isArray(chats)) {
    throw new Error('Invalid import data: expected an array of chats');
  }

  let importedCount = 0;

  for (const chat of chats) {
    if (!chat.id || !chat.messages) {
      continue;
    }

    const nextId = await getNextId(db);
    const newUrlId = chat.urlId ? await getUrlId(db, chat.urlId) : undefined;

    await setMessages(db, nextId, chat.messages, newUrlId, chat.description);
    importedCount++;
  }

  return importedCount;
}

// ==================== SETTINGS ====================

export async function getSettings(db: IDBDatabase): Promise<UserSettings> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('settings', 'readonly');
    const store = transaction.objectStore('settings');
    const request = store.get('userSettings');

    request.onsuccess = () => {
      if (request.result) {
        resolve(request.result.value as UserSettings);
      } else {
        resolve({ ...DEFAULT_SETTINGS });
      }
    };

    request.onerror = () => reject(request.error);
  });
}

export async function saveSettings(db: IDBDatabase, settings: UserSettings): Promise<void> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('settings', 'readwrite');
    const store = transaction.objectStore('settings');

    const request = store.put({ key: 'userSettings', value: settings });

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}
