# backend

(backend) C:\Users\HP ProBook\Desktop\hackathon\Todo\backend>uv run uvicorn main:app --reload --port 8000
INFO:     Will watch for changes in these directories: ['C:\\Users\\HP ProBook\\Desktop\\hackathon\\Todo\\backend']
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process [10384] using WatchFiles
INFO:     Started server process [11700]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     127.0.0.1:56366 - "OPTIONS /api/u5rWZxr7a8EwCsgIcg1pwNzH2XrAUAo6/tasks HTTP/1.1" 200 OK
INFO:     127.0.0.1:56366 - "OPTIONS /api/u5rWZxr7a8EwCsgIcg1pwNzH2XrAUAo6/tasks HTTP/1.1" 200 OK
INFO:     127.0.0.1:56366 - "GET /api/u5rWZxr7a8EwCsgIcg1pwNzH2XrAUAo6/tasks HTTP/1.1" 401 Unauthorized
INFO:     127.0.0.1:56366 - "GET /api/u5rWZxr7a8EwCsgIcg1pwNzH2XrAUAo6/tasks HTTP/1.1" 401 Unauthorized
INFO:     127.0.0.1:64404 - "POST /api/u5rWZxr7a8EwCsgIcg1pwNzH2XrAUAo6/tasks HTTP/1.1" 401 Unauthorized



# frontend

(c) Microsoft Corporation. All rights reserved.

C:\Users\HP ProBook\Desktop\hackathon\Todo>cd frontend

C:\Users\HP ProBook\Desktop\hackathon\Todo\frontend>npm run dev

> frontend@0.1.0 dev
> next dev

[baseline-browser-mapping] The data in this module is over two months old.  To ensure accurate Baseline data, please update: `npm i baseline-browser-mapping@latest -D`
   ▲ Next.js 16.0.10 (Turbopack)
   - Local:         http://localhost:3000
   - Network:       http://192.168.0.106:3000
   - Environments: .env

 ✓ Starting...
 ✓ Ready in 7.1s
 ○ Compiling / ...
 GET / 200 in 11.6s (compile: 10.4s, render: 1174ms)
 ○ Compiling /sign-up ...
 GET /sign-up 200 in 5.3s (compile: 5.1s, render: 221ms)
 GET / 200 in 460ms (compile: 16ms, render: 444ms)
 GET /sign-up 200 in 87ms (compile: 9ms, render: 78ms)
 ○ Compiling /api/auth/[...all] ...
(node:6460) Warning: SECURITY WARNING: The SSL modes 'prefer', 'require', and 'verify-ca' are treated as aliases for 'verify-full'.
In the next major version (pg-connection-string v3.0.0 and pg v9.0.0), these modes will adopt standard libpq semantics, which have weaker security guarantees.

To prepare for this change:
- If you want the current behavior, explicitly use 'sslmode=verify-full'
- If you want libpq compatibility now, use 'uselibpqcompat=true&sslmode=require'

See https://www.postgresql.org/docs/current/libpq-ssl.html for libpq SSL mode definitions.
(Use `node --trace-warnings ...` to show where the warning was created)
 POST /api/auth/sign-up/email 200 in 11.3s (compile: 9.8s, render: 1506ms)
 GET /dashboard 200 in 1187ms (compile: 1090ms, render: 97ms)
 GET /api/auth/get-session 200 in 209ms (compile: 52ms, render: 157ms)
 GET /api/auth/get-session 200 in 149ms (compile: 10ms, render: 140ms)
 GET /api/auth/token 200 in 667ms (compile: 8ms, render: 659ms)
 GET /api/auth/token 200 in 128ms (compile: 9ms, render: 119ms)
 GET /api/auth/token 200 in 715ms (compile: 24ms, render: 691ms)
