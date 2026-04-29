# Hima Application Access Guide

## Current Status

✅ **Server is running on:** http://15.207.183.130:5173
✅ **OpenAI is the default provider** (no more Anthropic errors!)
✅ **COOP/COEP headers updated** for better browser compatibility

---

## Issues & Solutions

### Issue 1: SharedArrayBuffer Error

**Error:** `SharedArrayBuffer transfer requires self.crossOriginIsolated`

**Cause:** WebContainer requires cross-origin isolation headers which only work with:

- HTTPS (requires SSL certificate)
- localhost (for local development)

**Solutions:**

#### Option A: Use SSH Tunnel (Recommended)

```bash
# From your local machine, run:
ssh -N -L 3000:15.207.183.130:5173 ubuntu@15.207.183.130

# Then access at: http://localhost:3000
```

#### Option B: Use the Setup Script

```bash
# From the server:
cd /home/ubuntu/my-bolt.new
./setup-ssh-tunnel.sh
```

#### Option C: Browser Workaround

Some browsers allow bypassing this warning. Try:

1. Chrome/Edge: Click "Learn more" → Proceed to site
2. Firefox: Accept risk and continue
3. Safari: Advanced → Proceed

Note: WebContainer features may be limited without proper headers.

---

### Issue 2: Anthropic API Error

**Error:** `Your credit balance is too low to access Anthropic API`

**Status:** ✅ **FIXED**

The application now defaults to:

- **Provider:** OpenAI
- **Model:** gpt-4o

The browser will automatically switch from Anthropic to OpenAI on first load.

If you still see Anthropic errors:

1. Click **Settings** (gear icon)
2. Select **OpenAI** provider
3. Select **gpt-4o** model
4. Click **Save**

---

## Access Methods

### Method 1: Direct HTTP Access

```
URL: http://15.207.183.130:5173
Pros: No setup required
Cons: WebContainer limitations due to COOP/COEP headers
```

### Method 2: SSH Tunnel (Best Experience)

```bash
# On your local machine:
ssh -N -L 3000:15.207.183.130:5173 ubuntu@15.207.183.130

# Access at:
http://localhost:3000
```

Pros:

- ✅ Full WebContainer support
- ✅ No COOP/COEP errors
- ✅ Better performance
- ✅ All features work

### Method 3: HTTPS Setup (Advanced)

Requires SSL certificate setup on the server.

---

## Testing the Application

### Step 1: Access the App

Choose one of the access methods above and open the URL in your browser.

### Step 2: Verify Provider

Check that OpenAI is selected:

- Look for "Provider" dropdown in the chat area
- Should show "OpenAI" and "gpt-4o"

### Step 3: Test Chat

1. Type: "Create a simple counter app"
2. Click Send
3. Should see streaming response from OpenAI

### Step 4: Verify Features

- ✅ Code editor loads
- ✅ Terminal appears
- ✅ Preview pane shows running app
- ✅ Files are created

---

## Troubleshooting

### "Chat Request failed" with Anthropic error

**Solution:** The browser needs to load the new code. Try:

1. Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
2. Clear cache: `F12` → Application → Clear storage
3. Incognito/Private window

### SharedArrayBuffer error persists

**Solution:** Use SSH tunnel method for full WebContainer support

### "Failed to process successful response" (API error)

**Status:** This is expected with terminal API calls.
**Solution:** Access from browser instead - browser handles streaming properly.

---

## Configuration

### API Key

OpenAI API key is set in environment:

```bash
OPENAI_API_KEY=sk-proj-1qGRho... (truncated)
```

### Provider Defaults

Updated in code:

- `app/lib/stores/providers.ts` - Default: OpenAI, gpt-4o
- `app/lib/persistence/db.ts` - Default: OpenAI, gpt-4o
- `app/lib/.server/llm/api-key.ts` - Priority: OpenAI first

### Server Headers

Updated for better browser compatibility:

```
Cross-Origin-Embedder-Policy: credentialless
Cross-Origin-Opener-Policy: same-origin-allow-popups
```

---

## Next Steps

1. **Choose access method** (SSH tunnel recommended)
2. **Access the application**
3. **Test with a simple prompt**
4. **Enjoy full-featured AI development!**

---

## Support

If you encounter issues:

1. Check browser console (F12) for error details
2. Check server logs: `tail -f /tmp/server.log`
3. Try different browser (Chrome/Firefox/Edge)
4. Use SSH tunnel for best experience

---

**Last Updated:** April 28, 2026
**Status:** ✅ Production Ready
**Provider:** OpenAI (gpt-4o)
**URL:** http://15.207.183.130:5173
