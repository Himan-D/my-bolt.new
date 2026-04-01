interface Env {
  ANTHROPIC_API_KEY?: string;
  OPENAI_API_KEY?: string;
  GOOGLE_API_KEY?: string;
  OPENROUTER_API_KEY?: string;
  CLERK_PUBLISHABLE_KEY?: string;
  CLERK_SECRET_KEY?: string;
  MCP_SERVER_URL?: string;
  MCP_API_KEY?: string;
  OPENSHELL_POLICY_MODE?: 'audit' | 'enforce';
  OPENSHELL_ALLOWED_HOSTS?: string;
}
