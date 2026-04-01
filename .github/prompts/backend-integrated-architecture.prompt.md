---
description: 'Plan and implement backend-integrated architecture changes for this workspace'
name: 'Backend-Integrated Architecture'
argument-hint: 'Feature/change to design and integrate (e.g., Add project sharing with role-based access)'
agent: 'agent'
---

You are working in this repository. Design and implement a backend-integrated architecture plan for the requested feature/change.

Requested change:
${input:Feature/change to design and integrate}

Requirements:

1. Treat backend integration as mandatory.
2. Default behavior: provide a plan and implement feasible changes unless the user explicitly asks for planning only.
3. Identify existing backend touchpoints first:

- API routes in app/routes, especially files named api.\*
- Server/runtime logic in app/lib/runtime
- Persistence in app/lib/persistence and related stores/types
- Edge/function entry points in functions and worker config files

4. Ensure all backend proposals are compatible with the existing Cloudflare Worker/functions setup (wrangler + functions runtime assumptions).
5. Propose concrete backend changes:

- Endpoints/routes to add or modify
- Request/response contracts with typed shapes
- Data model or persistence updates
- Auth/authorization and validation needs
- Error handling and observability/logging updates

6. Propose frontend integration changes needed for the backend work:

- Client calls, state/store updates, and UI behavior changes
- Loading/error states and optimistic update considerations

7. Validate consistency with current architecture:

- Reuse existing patterns and naming conventions
- Avoid duplicating utilities or creating parallel abstractions

Execution format:

1. Discovery summary

- Current architecture and reusable patterns found in the repo

2. Backend-first implementation plan

- Ordered steps with file-level targets
- API contracts and persistence changes

3. Integration plan

- Frontend wiring to backend APIs
- State and UX implications

4. Test strategy

- Unit/integration tests to add or update
- Key edge cases and failure scenarios

5. Deliverable output

- Default: edit files directly when feasible and list exactly what changed
- If asked to plan only, provide a file-by-file change proposal with rationale

Constraints:

- Keep solutions production-minded and incremental.
- Prioritize clear contracts between frontend and backend.
- Flag assumptions explicitly when required details are missing.
