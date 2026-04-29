# Environment variables - set these in your .env.local file
# OPENAI_API_KEY=your-api-key-here

export PORT=5173
export NODE_ENV=production

# Load environment from .env.local if exists
if [ -f .env.local ]; then
  set -a
  source .env.local
  set +a
fi

exec node server.js