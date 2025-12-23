# Frontend API Integration (Auto-generated)

This document describes the API client, hooks, and endpoints wired into the React frontend for the Dawlity project.

## Quick Summary
- Central axios client: `src/api/client.js`
- API wrappers: `src/api/authService.js`, `src/api/storyService.js`, `src/api/adminService.js`
- Hooks: `src/hooks/useAuth.js`, `src/hooks/useStories.js`, `src/hooks/useAdmin.js`
- Components updated: `src/components/LoginForm.jsx`

## Base URL and path
- The axios client uses `process.env.REACT_APP_BASE_URL` and `process.env.REACT_APP_API_BASE_PATH` when present. Otherwise it falls back to the values exported from `src/api/config.js` (`BASE_URL` and `API_BASE_PATH`).

Note: The OpenAPI file in `collection2.yaml` declares paths that start at root (for example `/auth/login`, `/stories`), while `src/api/config.js` currently sets `API_BASE_PATH` to `/api/v1`. This may cause endpoints to be requested under `/api/v1` (e.g. `http://localhost:8080/api/v1/auth/login`) while the backend described by the YAML expects `http://localhost:8080/auth/login`. Please confirm which base path is correct and adjust `REACT_APP_API_BASE_PATH` or `src/api/config.js` accordingly.

## Authentication
- Login: `POST /auth/login` -> implemented in `loginUser` (authService)
- Register: `POST /auth/register` -> `registerUser`
- Verify: `POST /auth/verify` (query params: `email`, `code`) -> `verifyEmail`
- Refresh token: `POST /auth/refresh-token` -> `refreshToken` implemented in client interceptor

Tokens stored:
- `accessToken` -> `src/api/config.js` `ACCESS_TOKEN_KEY`
- `refreshToken` -> `REFRESH_TOKEN_KEY`
- `user` object stored under localStorage key `user`

## Story Endpoints (implemented)
- `GET /public/stories` -> `fetchStories()` (used by `useStories`)
- `GET /public/stories/{id}` -> `getStoryById(id)`
- `POST /stories` -> `submitNewStory(payload)` (supports FormData or JSON)
- `PUT /stories/{id}` -> `updateStory(id, payload)`
- `DELETE /stories/{id}` -> `deleteStory(id)`
- `GET /stories/my-stories/{publisherId}` -> `getMyStories(publisherId)`

## Admin Endpoints (implemented)
- `GET /admin/stories/pending` -> `getPendingStories()`
- `PUT /admin/stories/{id}/approve` -> `approveStory(id)`
- `PUT /admin/stories/{id}/reject` -> `rejectStory(id, message?)`
- `PUT /admin/stories/{id}/request-modification` -> `requestModification(id, note)`

## Hooks Usage
- `useAuth()` returns `{ user, loading, error, login, logout, register }`.
- `useStories()` returns `{ data, loading, error, fetchAll, submit }`.
- `useAdmin()` returns `{ pending, loading, error, fetchPending, approve, reject, requestModification }`.

Example (Login):

```js
const { login } = useAuth();
await login(email, password);
```

Example (Submit text story):

```js
const { submit } = useStories();
await submit({ title, content, type: 'TEXT', province, incidentDate });
```

## Files Modified / Added
- Added: `src/api/client.js`
- Modified: `src/api/authService.js` (refactor to axios)
- Modified: `src/api/storyService.js` (refactor to axios)
- Added: `src/api/adminService.js`
- Added: `src/hooks/useAuth.js`
- Added: `src/hooks/useStories.js`
- Added: `src/hooks/useAdmin.js`
- Modified: `src/components/LoginForm.jsx` (now uses `useAuth`)

## Inconsistencies & Notes for Backend Team
1. Base path mismatch: OpenAPI `collection2.yaml` uses root paths (`/auth`, `/stories`), but `src/api/config.js` sets `API_BASE_PATH` to `/api/v1`. Confirm intended prefix.
2. Some endpoints in front-end code previously referenced paths like `/auth/forgot-password` and `/auth/verify-reset-code` which are not present in the provided OpenAPI snippet; verify these endpoints if they exist or adjust frontend flows.
3. The OpenAPI spec does not declare a security scheme; the frontend assumes JWT Bearer tokens via `Authorization` header and implements token refresh at `/auth/refresh-token`. Confirm the refresh-token contract matches the OpenAPI `RefreshTokenRequest` and `AuthResponse` schema.

## Next Steps
1. Confirm the correct `BASE_URL` and `API_BASE_PATH` and set them in `.env` as `REACT_APP_BASE_URL` and `REACT_APP_API_BASE_PATH` (or update `src/api/config.js`).
2. Wire any missing endpoints (forgot-password, verify-reset-code) if they exist on the backend.
3. Optionally add more hooks for single-story fetch (`useStory`) and admin actions inside components.

## Environment example
Create a `.env` in the project root (do NOT commit secrets) and add:

```
REACT_APP_BASE_URL=http://localhost:8080
REACT_APP_API_BASE_PATH=    # set to '/api/v1' if backend uses that prefix, or leave empty
```

## Route protection
 - A `ProtectedRoute` component was added at `src/components/ProtectedRoute.jsx`. Use it in `App.js` to guard routes and optionally provide `roles` prop for role-based access.
