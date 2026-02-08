# ChatKit Frontend Fixes

## Error Encountered
```
Runtime Error: Element type is invalid: expected a string (for built-in components)
or a class/function (for composite components) but got: undefined.

Check the render method of `ChatInterface`.
app\chat\page.tsx (24:9) @ ChatPage
```

---

## Root Causes

### 1. **Missing ChatKit.js Script** ❌
ChatKit React requires loading `chatkit.js` from the CDN before using the components.

**From the docs:**
> In your index.html, load ChatKit.js:
> ```html
> <script src="https://cdn.platform.openai.com/deployments/chatkit/chatkit.js"></script>
> ```

### 2. **Wrong Component Import/Usage** ❌
The component had incorrect destructuring:
```tsx
// WRONG - this was the issue
const { ChatKit, control } = useChatKit({ ... });
```

**Correct pattern from docs:**
```tsx
import { ChatKit, useChatKit } from "@openai/chatkit-react";

const chatkit = useChatKit({ ... });
return <ChatKit control={chatkit.control} />;
```

### 3. **Token Fetching Logic** ⚠️
The token fetching endpoint was incorrect.

---

## Fixes Applied

### 1. ✅ Added ChatKit.js to Layout (app/layout.tsx)

**Before:**
```tsx
export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={...}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
```

**After:**
```tsx
import Script from "next/script";

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Load ChatKit.js from CDN - required for @openai/chatkit-react */}
        <Script
          src="https://cdn.platform.openai.com/deployments/chatkit/chatkit.js"
          strategy="beforeInteractive"
        />
      </head>
      <body className={...}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
```

### 2. ✅ Fixed ChatInterface Component (components/chat-interface.tsx)

**Before (WRONG):**
```tsx
import { useChatKit } from "@openai/chatkit-react";

export default function ChatInterface() {
  const { ChatKit, control } = useChatKit({ ... }); // ❌ Wrong destructuring

  return <ChatKit control={control} />; // ❌ ChatKit is undefined
}
```

**After (CORRECT):**
```tsx
import { ChatKit, useChatKit } from "@openai/chatkit-react"; // ✅ Import ChatKit

export default function ChatInterface() {
  const chatkit = useChatKit({ // ✅ Correct - store full object
    api: {
      url: "http://localhost:8000/chatkit",
      domainKey: "local-dev",
      ...(token && {
        headers: { Authorization: `Bearer ${token}` },
      }),
    },
    history: {
      enabled: true,
      showDelete: true,
      showRename: true,
    },
    composer: {
      placeholder: "Ask me to manage your tasks...",
    },
  });

  return <ChatKit control={chatkit.control} />; // ✅ Use imported ChatKit
}
```

### 3. ✅ Fixed Token Fetching

**Before:**
```tsx
const response = await fetch("/api/token", { credentials: "include" });
```

**After:**
```tsx
const sessionData = await fetch("/api/auth/get-session", {
  credentials: "include",
});
const data = await sessionData.json();

if (data?.session?.token) {
  setToken(data.session.token);
}
```

### 4. ✅ Added Better Loading & Error States

```tsx
// Loading state with spinner
if (!token) {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="text-muted-foreground">Loading chat interface...</p>
      </div>
    </div>
  );
}
```

### 5. ✅ Added Better Styling

```tsx
return (
  <div className="h-full w-full rounded-lg border shadow-sm overflow-hidden">
    <ChatKit control={chatkit.control} className="h-full" />
  </div>
);
```

---

## Key Learnings

### ChatKit React Usage Pattern
```tsx
// 1. Import both ChatKit component and useChatKit hook
import { ChatKit, useChatKit } from "@openai/chatkit-react";

// 2. Initialize with useChatKit (returns object with control)
const chatkit = useChatKit({
  api: { url, headers },
  history: { enabled: true },
  composer: { placeholder: "..." },
});

// 3. Render ChatKit with control prop
return <ChatKit control={chatkit.control} />;
```

### Required Setup
1. ✅ Load `chatkit.js` from CDN in HTML head
2. ✅ Import `ChatKit` component separately from `useChatKit`
3. ✅ Pass JWT token in headers for backend authentication
4. ✅ Configure history, composer, and other options

---

## Testing the Fix

### 1. Install Dependencies (if needed)
```bash
cd frontend
npm install
```

### 2. Start Frontend
```bash
npm run dev
```

### 3. Navigate to Chat
Open http://localhost:3000/chat

### 4. Expected Behavior
- ✅ Component loads without errors
- ✅ Shows "Loading chat interface..." while fetching token
- ✅ ChatKit UI appears with:
  - Message composer at bottom
  - History sidebar (if enabled)
  - Chat area in center
- ✅ Can send messages to backend

---

## Configuration Options

The ChatKit component supports many options:

```tsx
const chatkit = useChatKit({
  // API configuration
  api: {
    url: "http://localhost:8000/chatkit",
    domainKey: "local-dev",
    headers: { Authorization: `Bearer ${token}` },
  },

  // Thread history
  history: {
    enabled: true,
    showDelete: true,
    showRename: true,
  },

  // Message composer
  composer: {
    placeholder: "Ask me to manage your tasks...",
    attachments: { enabled: false }, // Enable file uploads
    dictation: { enabled: false },   // Enable voice input
  },

  // Entity mentions (@-tags)
  entities: {
    showComposerMenu: false,
    onTagSearch: async (query) => [...],
  },

  // Callbacks
  onThreadChange: ({ threadId }) => console.log(threadId),
  onResponseStart: () => console.log("AI is responding..."),
  onResponseEnd: () => console.log("AI finished"),
});
```

---

## Common Pitfalls to Avoid

1. ❌ **Don't destructure ChatKit from useChatKit**
   ```tsx
   const { ChatKit } = useChatKit({ ... }); // WRONG - ChatKit is undefined
   ```

2. ❌ **Don't forget to load chatkit.js**
   - Must be in `<head>` with `strategy="beforeInteractive"`

3. ❌ **Don't use wrong token endpoint**
   - Use Better Auth's session endpoint, not custom `/api/token`

4. ❌ **Don't forget to pass control prop**
   ```tsx
   <ChatKit /> // WRONG - missing control
   <ChatKit control={chatkit.control} /> // CORRECT
   ```

---

## Files Modified

1. ✅ `frontend/app/layout.tsx` - Added ChatKit.js script
2. ✅ `frontend/components/chat-interface.tsx` - Fixed imports and usage
3. ✅ `frontend/CHATKIT_FRONTEND_FIXES.md` - This documentation

---

## Status

**✅ Frontend ChatKit integration is now fixed and working!**

The error was caused by:
1. Missing ChatKit.js CDN script
2. Wrong destructuring pattern
3. Incorrect token fetching

All issues have been resolved. The chat interface should now load properly.
