# ConnectSphere Frontend

## Project Overview

ConnectSphere is a social media platform frontend built with vanilla HTML, CSS, and JavaScript (ES6 modules). The application consists of multiple HTML pages (index.html, profile.html, notifications.html, bookmarks.html, settings.html, post.html, login.html, create-account.html, forgot-password.html, reset-password.html, confirm-email.html) that communicate with a backend API at `https://localhost:7068/api`. The frontend handles user authentication, posts/feed, profiles, notifications, bookmarks, follow system, and settings.

## Technology Stack

- **Language**: JavaScript (ES6+ modules)
- **Build Tool**: None (vanilla, no bundler)
- **Styling**: Custom CSS with CSS custom properties (variables) — 5 files: `designsystem.css`, `base.css`, `layout.css`, `module.css`, `state.css`
- **Framework**: None (vanilla)
- **State Management**: None (manual DOM manipulation, per-page local variables)
- **HTTP Client**: Custom `apiClient.js` wrapper around Fetch API
- **Authentication**: Bearer token (JWT) stored in localStorage (persistent) or sessionStorage (temporary)
- **Routing**: Full-page navigation between separate HTML files (`window.location.href`, `window.location.replace`)
- **Icons**: Material Symbols Outlined (Google Fonts), Font Awesome 6.5.0
- **Fonts**: Plus Jakarta Sans (headings), Be Vietnam Pro (body)

## Project Structure

```
E:\Depi\ConnectSphere\
├── index.html              # Home/feed page
├── profile.html            # User profile page
├── notifications.html      # Notifications page
├── bookmarks.html          # Bookmarks page
├── settings.html           # Settings page
├── post.html               # Single post page
├── login.html              # Login page
├── create-account.html     # Registration page
├── forgot-password.html    # Forgot password page
├── reset-password.html     # Reset password page
├── confirm-email.html      # Email confirmation page
├── css/
│   ├── designsystem.css    # CSS custom properties (colors, spacing, typography)
│   ├── base.css            # Base/reset styles
│   ├── layout.css          # Layout components (nav, sidebar, feed, cards)
│   ├── module.css          # Component styles (cards, forms, buttons, etc.)
│   └── state.css           # Interactive states (hover, focus, active)
├── js/
│   ├── index.js            # Home page logic (feed, compose, follow suggestions)
│   ├── profile.js          # Profile page logic (tabs, posts, follow)
│   ├── notifications.js    # Notifications page logic
│   ├── bookmarks.js        # Bookmarks page logic
│   ├── settings.js         # Settings page logic
│   ├── post-page.js        # Single post page logic
│   ├── login.js            # Login logic
│   ├── create-account.js   # Registration logic
│   ├── forgot-password.js  # Forgot password logic
│   ├── reset-password.js   # Reset password logic
│   ├── confirm-email.js    # Email confirmation logic
│   ├── validation.js       # Form validation utilities
│   └── Api/
│       ├── apiClient.js    # Centralized HTTP client
│       ├── userApi.js      # Auth & user endpoints
│       ├── postApi.js      # Post/feed/bookmark endpoints
│       └── notificationsApi.js  # Notification endpoints
│   └── util/
│       ├── global.js       # Shared navbar logic (notifications, profile link)
│       ├── pagination.js   # Pagination + infinite scroll helper
│       ├── show.js         # Banner + empty state utilities
│       └── post.js         # Post rendering utilities
├── image/                  # Static images (avatars, defaults)
└── assets/                 # Favicon
```

## Architecture

### Core Layers

1. **Presentation Layer** — HTML defines page structure; CSS provides styling via custom properties; JavaScript handles DOM interactions.
2. **Service Layer** — `apiClient.js` centralizes all HTTP communication (auth headers, timeout, error parsing). Feature-specific modules (`userApi.js`, `postApi.js`, `notificationsApi.js`) wrap endpoints.
3. **Business Logic** — Each page has its own entry point (`index.js`, `profile.js`, etc.) that orchestrates API calls and DOM updates on `DOMContentLoaded`.

### Data Flow

1. Page loads → `DOMContentLoaded` fires
2. Check `localStorage.getItem('token')` — redirect to login if missing
3. Call API via `apiClient.js` (adds Bearer token automatically)
4. On success: render data into DOM (create elements, append to containers)
5. On error: show banner/error message, handle 401 by clearing token and redirecting to login

## JavaScript Modules

### Module Conventions

- All JS files use `<script type="module">` with relative imports (`./`, `../`)
- Named exports used throughout (`export function`, `export const`)
- No default exports observed
- Side effects (DOM manipulation, event listeners) typically inside `DOMContentLoaded` handlers or init functions

### Key Modules

| Module | Purpose |
|--------|---------|
| `apiClient.js` | Centralized fetch wrapper: base URL, timeout (8s), auth header, JSON/FormData, error handling |
| `userApi.js` | Auth (login, register, confirm, forgot/reset password), profile, settings, follow suggestions, follow/unfollow |
| `postApi.js` | Create post, get feed, get post, get reacted posts, bookmarks |
| `notificationsApi.js` | Get unread notifications/count, mark read, mark all read |
| `pagination.js` | `createPagination({pageSize, fetchData, renderItems, emptyState})` returns `{load, attachInfiniteScroll}` |
| `show.js` | `showBanner(message, type)`, `hideBanner()`, `showEmptyFeedState(container)`, `hideEmptyFeedState(container)` |
| `post.js` | `extractTags(content)`, `CreatePostFeedItem({content, tags, postId, userProfile, imagesUrls, createdAt})` |
| `global.js` | Navbar: notification badge count, profile button redirect |
| `validation.js` | `validateEmail`, `validateUsername`, `validatePassword`, `validateConfirmPassword` (DOM-coupled) |

## API Communication

### Centralized Client (`apiClient.js`)

```javascript
const API_BASE = 'https://localhost:7068/api';

apiClient(endpoint, {
  method = 'GET',
  body,
  headers = {},
  timeout = 8000,
  auth = false,
  formData = false
})
```

- **Base URL**: `https://localhost:7068/api`
- **Authentication**: When `auth: true`, reads `localStorage.getItem('token')` and adds `Authorization: Bearer <token>`
- **Content-Type**: `application/json` by default; omitted for `formData: true` (FormData)
- **Timeout**: 8000ms via `AbortController`
- **Error Handling**: Throws `ApiError(message, status, data)` on non-OK responses; `Error("Request timeout")` on abort
- **Response**: Returns parsed JSON (or `null` if parsing fails)

### Endpoints Used

| Module | Function | Endpoint | Method | Auth |
|--------|----------|----------|--------|------|
| userApi | login | `/Auth/login` | POST | No |
| userApi | register | `/Auth/register` | POST | No |
| userApi | confirmEmail | `/Auth/confirm-email` | GET | No |
| userApi | forgotPassword | `/Auth/forgot-password` | POST | No |
| userApi | resetPassword | `/Auth/reset-password` | POST | No |
| userApi | getUserProfileImage | `/profile/me/picture-url` | GET | Yes |
| userApi | getUserProfile | `/profile/me` | GET | Yes |
| userApi | getSettings | `/profile/me/settings` | GET | Yes |
| userApi | getPublicUserProfile | `/profile/{userName}` | GET | Yes |
| userApi | updateSettings | `/profile/me/settings` | PUT | Yes (FormData) |
| userApi | getFollowSuggestions | `/Recommendations` | GET | Yes |
| userApi | followUser | `/users/{userId}/follow` | POST | Yes |
| userApi | unfollowUser | `/users/{userId}/unfollow` | POST | Yes |
| postApi | CreatePost | `/Posts` | POST | Yes (JSON or FormData) |
| postApi | GetPosts | `/Feed` | GET | Yes |
| postApi | GetUserReactedPosts | `/Posts/reacted` | GET | Yes |
| postApi | GetPost | `/Posts/{postId}` | GET | Yes |
| postApi | GetBookmarks | `/Bookmarks` | GET | Yes |
| postApi | DeleteBookmark | `/Bookmarks/{postId}` | DELETE | Yes |
| notificationsApi | GetUnReadNotifications | `/Notifications` | GET | Yes |
| notificationsApi | GetUnReadNotificationsCount | `/Notifications/unread-count` | GET | Yes |
| notificationsApi | MarkNotificationAsRead | `/Notifications/{id}/read` | POST | Yes |
| notificationsApi | MarkAllNotificationsAsRead | `/Notifications/read-all` | POST | Yes |

### Pagination Parameters

- Feed: `page` (default 1), `pageSize` (default 10)
- Notifications: `page`, `pageSize` (default 20), `unreadOnly=true`
- Bookmarks: `page`, `pageSize` (default 20)
- Follow suggestions: `page` (default 1), `pageSize` (default 5)

### Error Handling Pattern

```javascript
try {
  const data = await apiCall();
} catch (error) {
  if (error.message === 'Request timeout') { /* ... */ }
  else if (error.status === 400) { /* validation */ }
  else if (error.status === 401) { localStorage.removeItem('token'); redirectToLogin(); }
  else if (error.status === 404) { localStorage.removeItem('token'); redirectToLogin(); }
  else if (error.status === 500) { /* server error */ }
  else { /* generic */ }
}
```

### Token Storage

- **Persistent** (Remember me): `localStorage.setItem('token')`, `localStorage.setItem('refreshToken')`
- **Temporary**: `sessionStorage.setItem('token')`, `sessionStorage.setItem('refreshToken')`
- **Note**: `refreshToken` is stored but **no token refresh logic exists** — only cleared on 401

### Protected Pages

All main pages (`index.html`, `profile.html`, `notifications.html`, `bookmarks.html`, `settings.html`, `post.html`) check `localStorage.getItem('token')` on `DOMContentLoaded` and redirect to `/login.html` if missing.

### 401 Handling

On any 401 response: `localStorage.removeItem('token')`, `window.location.replace('/login.html')` (with optional `sessionStorage.setItem('loginMessage', ...)`).

## UI and DOM Conventions

### Page Layout (Home/Profile/Notifications/Bookmarks/Settings)

- **Top Nav** (`.top-nav`): Logo, search input (non-functional), notification icon, account avatar
- **Left Sidebar** (`.sidebar-left`): Navigation links (Home, Notifications, Bookmarks, Profile), Settings in footer
- **Center** (`.feed-center`): Page-specific content (feed, profile tabs, notifications list, bookmarks)
- **Right Sidebar** (`.sidebar-right`): "Who to follow" suggestions (hidden on mobile ≤800px)

### Component Classes (from CSS)

| Component | Classes |
|-----------|---------|
| Button (primary) | `.security_card_form_submit`, `.sidebar-post-btn`, `.compose-post-btn`, `.profile-action-btn` |
| Button (icon) | `.top-nav-icon-btn`, `.compose-icon-btn`, `.feed-item-action`, `.feed-item-menu` |
| Input | `.security_card_form_group_input`, `.top-nav-search-input`, `.settings-input`, `.settings-textarea` |
| Card | `.security_card`, `.compose-card`, `.feed-item`, `.notification-card`, `.bookmark-card`, `.profile-card`, `.post-card` |
| Avatar | `.compose-avatar`, `.feed-item-avatar`, `.notification-avatar`, `.profile-avatar`, `.follow-user-avatar` |
| Tag | `.tag`, `.feed-item-tags`, `.post-tags` |
| Empty State | `.empty-state` |
| Banner | `.security_card_banner`, `.visible`, `.banner-info`, `.banner-warning`, `.banner-success`, `.banner-error` |
| Tabs | `.profile-tabs`, `.profile-tab`, `.active` |
| Switch/Toggle | `.switch`, `.slider` |

### DOM Manipulation Patterns

- **Element creation**: `document.createElement('tag')`, set `className`, `innerHTML`, `dataset`
- **Appending**: `container.appendChild(element)` or `container.prepend(element)` (feed adds newest first)
- **Querying**: `document.querySelector()`, `document.querySelectorAll()`, `element.querySelector()`
- **Event binding**: `element.addEventListener('click', handler)` — often inline in render functions
- **Data attributes**: `dataset.postId`, `dataset.userId`, `dataset.following`, `dataset.profileUrl`

### Form Handling

- Forms use native `<form>` with `submit` event
- `e.preventDefault()` → client validation → disable submit button → API call → re-enable
- Validation: inline in `validation.js` (couples to DOM via `.security_card_form_group_input_container.error`)
- File inputs: hidden, triggered via button click (`input.click()`), preview via `FileReader.readAsDataURL()`
- Upload: `FormData.append('Images', file)` per file → `CreatePost` with `formData: true`

### CSS Conventions

- **5 files** loaded in order: `designsystem.css` → `base.css` → `layout.css` → `module.css` → `state.css`
- **No CSS Modules** — all global classes
- **CSS Custom Properties** (defined in `designsystem.css:root`):
  - Colors: `--color-primary`, `--color-primary-hover`, `--color-background`, `--color-surface`, `--color-text-main`, `--color-text-secondary`, `--color-text-muted`, `--color-border`, `--color-error`
  - Typography: `--font-family`, `--font-family-body`, `--font-weight-*`, `--font-size-*`
  - Spacing: `--spacing-1` through `--spacing-12` (8px base unit)
  - Radius: `--radius-sm` through `--radius-full`
  - Layout: `--navbar-height`, `--sidebar-left-width`, `--sidebar-right-width`
  - Shadows: `--shadow-sm`, `--shadow-md`
- **Naming**: BEM-ish for components (`.feed-item`, `.security_card_form_submit`, `.profile-action-btn`), utility classes (`.hidden`, `.cursor-pointer`, `.visible`)
- **Responsive**: Media queries at 1120px, 980px, 900px, 800px, 760px — sidebar-right hidden ≤800px, stacked layout ≤900px

## Posts and Feed

### Feed Page (`index.html` + `index.js`)

- **Compose Card** (`.compose-card`): Textarea, hidden file input (multiple), image preview grid, toolbar (image, emoji), post button
- **Feed List** (`.feed-posts-list`): Container for `.feed-item` articles
- **Post Rendering** (`post.js:CreatePostFeedItem`): Creates `<article class="feed-item" data-post-id>` with header (avatar, name, handle, time, menu), content (text, tags, images), actions (chat, repeat, favorite, share)
- **Infinite Scroll**: `pagination.js` loads 10 posts/page, attaches scroll listener (300px threshold)
- **Empty State**: Shows "No content yet" when feed empty
- **Image Upload**: `FormData` with `Content`, `Tags[]`, `Images[]` (multiple)

### Post Creation Flow

1. User types content, optionally selects images
2. Click Post → `extractTags(content)` extracts `#hashtag` → `CreatePost(content, tags, images)`
3. On success: `CreatePostFeedItem` prepends to feed, clears form, shows success banner

### Single Post Page (`post.html` + `post-page.js`)

- Loads one post via `GetPost(postId)` from query string `?id=`
- Renders into static HTML structure (avatar, author, time, content, tags, images)
- No interaction logic (reactions, comments not implemented)

## User Profiles

### Profile Page (`profile.html` + `profile.js`)

- **URL**: `profile.html` (own profile) or `profile.html?user=username` (other profile)
- **Profile Card** (`.profile-card`): Hero (avatar), name, handle, follow/edit button, bio, join date, stats (posts, followers, following)
- **Tabs** (`.profile-tabs`): Posts / Saved / Likes — dynamically created in `initializeTabs()`
- **Posts Tab**: Infinite scroll feed (10/page) via `GetPosts` (own) or filtered feed (other)
- **Saved Tab**: Bookmarks via `GetBookmarks` (20/page)
- **Likes Tab**: Reacted posts via `GetUserReactedPosts` (20/page)
- **Follow Suggestions**: Right sidebar, 5 users via `getFollowSuggestions(1, 5)`
- **Follow Toggle**: `handleFollowToggle(userId, button)` calls `followUser`/`unfollowUser`, updates button text and `data-following`

### Profile Rendering Details

- `updateProfileCard(user, isMine)`: Creates card, inserts before posts list
- `createPostCard(post)`: Creates `.post-card` for profile tabs (different from feed `.feed-item`)
- `isMatchingAuthor(post, userName)`: Heuristic match against multiple possible author fields
- `escapeHtml(str)`: Sanitizes API strings before `innerHTML` insertion

## Follow System

### Implementation

- **API**: `followUser(userId)` → POST `/users/{userId}/follow`, `unfollowUser(userId)` → POST `/users/{userId}/unfollow`
- **UI**: Button with `data-user-id`, `data-following="true|false"`, text "Follow"/"Following"
- **Locations**: 
  - Home right sidebar (`index.js:handleFollowClick`)
  - Notifications (`notifications.js:handleFollowClick` — "Follow Back" on follow notifications)
  - Profile page (`profile.js:handleFollowToggle`)
- **Error Handling**: 409 → "Already following", 404 → "User not found"

## Reactions and Comments

### Reactions

- **UI Only**: Feed items show 4 action buttons (chat, repeat, favorite, share) with Material icons
- **Post Cards** (profile tabs): Show counts — `likeCount`, `favoriteCount`, `commentCount`, `repostCount`
- **Post Detail** (`post.html`): Shows reaction buttons (`.reaction-btn`) for Like, Love, Haha, Wow, Sad, Angry, Care
- **No Implementation**: No API calls, no click handlers, no optimistic updates — purely presentational

### Comments

- **Not Implemented**: No comment UI, no comment API endpoints in `postApi.js`, no comment data in post responses
- **Feed UI**: Has chat icon button but no handler
- **Post Card**: Shows `commentCount` but no comment display or interaction

## Notifications

### Notifications Page (`notifications.html` + `notifications.js`)

- **Header**: "Notifications" + "Mark all as read" link (`.text-link`)
- **Container** (`.notifications-container`): Holds `.notification-card` elements
- **Loading**: `createPagination` with `GetUnReadNotifications` (20/page, `unreadOnly=true`)
- **Card Rendering** (`CreateNotificationCard`): Avatar, title, snippet, timestamp, "Follow Back" button for follow-type
- **Interactions**:
  - Click card → `MarkNotificationAsRead(id)` → remove card → update badge count
  - "Follow Back" → `followUser` → mark notification read
  - "Mark all as read" → `MarkAllNotificationsAsRead` → remove badge, show empty state
- **Badge**: Navbar notification icon shows unread count (`.notification-badge`) via `global.js`

### Real-time

- **Not Implemented**: Only loads on page load. No WebSocket, SSE, or polling.

## Bookmarks

### Bookmarks Page (`bookmarks.html` + `bookmarks.js`)

- **Header**: "Bookmarks" + "Manage saved items" link
- **Container** (`.bookmarks-container`): Holds `.bookmark-card` elements
- **Loading**: `createPagination` with `GetBookmarks` (20/page)
- **Card Rendering** (`CreateBookmarkCard`): Avatar, title, meta, description, tags, "Remove" button, "View original" link
- **Delete**: Click "Remove" → `DeleteBookmark(postId)` → remove card → show empty state if none left
- **Sanitization**: `escapeHtml()` applied to all text fields

## Settings

### Settings Page (`settings.html` + `settings.js`)

- **Form** (`.settings-card`): Profile image upload, first/last name, username, bio, privacy toggles (private profile, online status, email notifications)
- **Load**: `getSettings()` → populates fields
- **Save**: `FormData` with all fields + optional `ProfilePicture` file → `updateSettings(formData)`
- **Image Preview**: `FileReader` on `#profile-picture` change → updates `.profile-avatar` immediately
- **Toggles**: Custom CSS switch (`.switch` + `.slider`) for boolean settings

## Pagination and Infinite Scrolling

### `pagination.js:createPagination`

```javascript
createPagination({
  pageSize = 10,
  fetchData(page, pageSize),  // returns array or {items: []}
  renderItems(items),         // called with each page's items
  emptyState: { show, hide, clear }
})
```

### State

- `page` (starts at 1), `loading` (boolean), `hasMore` (boolean)

### `load(reset = false)`

1. Returns early if `loading` or (`!hasMore` and not `reset`)
2. Sets `loading = true`, resets `page=1`, `hasMore=true` if `reset`
3. Calls `fetchData(page, pageSize)`
4. Normalizes response: `Array.isArray(data) ? data : data.items || []`
5. If `reset`: `emptyState.clear()`
6. If no items: `emptyState.show()`, `hasMore = false`
7. Else: `emptyState.hide()`, `renderItems(items)`
8. If `items.length < pageSize`: `hasMore = false` else `page++`
9. Finally: `loading = false`

### Usage

- Feed (`index.js`): 10/page, `GetPosts`
- Notifications (`notifications.js`): 20/page, `GetUnReadNotifications`
- Bookmarks (`bookmarks.js`): 20/page, `GetBookmarks`
- Profile posts (`profile.js`): 10/page, `GetPosts` (own) or 50 once (other)
- Profile saved (`profile.js`): 20/page, `GetBookmarks`
- Profile likes (`profile.js`): 20/page, `GetUserReactedPosts`

## Image/File Handling

### Post Images (`index.js`)

- `<input type="file" id="imageUpload" accept="image/*" hidden multiple>`
- Triggered by image icon button click
- Preview: `FileReader.readAsDataURL()` → renders in `.compose-image-preview` grid
- Remove: Click × button → splices `selectedImages` array → re-renders preview
- Upload: `FormData.append('Images', file)` per file → `CreatePost` with `formData: true`

### Profile Image (`settings.js`)

- Hidden file input triggered by "Update photo" button
- Preview via `FileReader` → updates `.profile-avatar` immediately
- Saved as `FormData.append('ProfilePicture', file)` in settings submit

### Avatar Fallbacks

- Default: `./image/default-image-profile.png` (local)
- DiceBear fallback: `https://api.dicebear.com/7.x/avataaars/svg?seed={username}` (used in follow suggestions)

## Error Handling

### API Level (`apiClient.js`)

- Timeout: 8s via `AbortController` → throws `Error("Request timeout")`
- Non-OK response: Parses JSON, throws `ApiError(data?.detail || "Request failed", status, data)`
- Network/abort: Re-throws original error

### Page Level (All Pages)

```javascript
try {
  await apiCall();
} catch (error) {
  if (error.message === 'Request timeout') { showBanner('Server took too long...', 'error'); }
  else if (error.status === 400) { showBanner(error.message, 'warning'); }
  else if (error.status === 401) { localStorage.removeItem('token'); redirectToLogin(); }
  else if (error.status === 404) { localStorage.removeItem('token'); redirectToLogin(); }
  else if (error.status === 500) { showErrorScreen(); }
  else { showBanner('Unable to load...', 'error'); }
}
```

### Error Screen (500)

- Replaces center content with `.error-message` (icon, text, retry button calling `location.reload()`)

### Form Validation Errors

- Inline: `.security_card_form_group_input_container.error` + `.security_card_form_group_error` (CSS shows on `.error`)
- Form-level: `.security_card_form_error.visible`

### Banner Notifications (`showBanner`)

- Types: `info` (envelope), `success` (check), `warning`/`error` (triangle)
- Styles: `.banner-info` (blue), `.banner-success` (green), `.banner-warning` (amber), `.banner-error` (red)
- Auto-hide: Not automatic — cleared by next action or `hideBanner()`

## Naming Conventions

| Category | Convention | Examples |
|----------|------------|----------|
| Files | kebab-case | `userApi.js`, `post-page.js`, `designsystem.css` |
| CSS Classes | kebab-case | `.feed-item`, `.security_card_form_submit`, `.profile-action-btn` |
| JS Variables/Functions | camelCase | `feedPostsList`, `handleFeedLoading`, `CreatePostFeedItem` |
| JS Classes/Constructors | PascalCase | `ApiError` |
| Exported Functions | camelCase | `createPagination`, `showBanner`, `GetPosts` (API functions) |
| Data Attributes | kebab-case | `data-post-id`, `data-user-id`, `data-following` |
| CSS Custom Properties | kebab-case | `--color-primary`, `--spacing-4`, `--radius-lg` |

## Development Rules

### Preserve Existing Architecture

- **No frameworks**: Do not introduce React, Vue, Angular, Svelte, or any framework
- **No build tools**: No webpack, Vite, Rollup, esbuild — vanilla ES modules only
- **No state management**: No Redux, Zustand, Context, signals — use local variables and DOM
- **No new HTTP clients**: Use `apiClient.js` for all API communication
- **No new pagination**: Reuse `createPagination` from `util/pagination.js`
- **No new CSS architecture**: Keep 5-file structure and custom properties

### Reuse Existing Utilities

- **API calls**: Import from `userApi.js`, `postApi.js`, `notificationsApi.js`
- **Pagination**: Import `createPagination` from `util/pagination.js`
- **Banners/Empty states**: Import `showBanner`, `hideBanner`, `showEmptyFeedState`, `hideEmptyFeedState` from `util/show.js`
- **Post rendering**: Import `CreatePostFeedItem`, `extractTags` from `util/post.js`
- **Validation**: Import `validateEmail`, `validateUsername`, `validatePassword`, `validateConfirmPassword` from `validation.js`
- **Sanitization**: Use `escapeHtml` pattern (copy from `profile.js`/`bookmarks.js`)

### Follow Existing Conventions

- **Module pattern**: `<script type="module">`, relative imports, `DOMContentLoaded` entry point
- **Error handling**: Try/catch with status-code branching (401→logout, 404→logout, 500→error screen)
- **Auth checks**: `const token = localStorage.getItem('token'); if (!token) redirectToLogin();`
- **DOM creation**: `document.createElement`, set `className`, `innerHTML`, `dataset`, `appendChild`
- **Event binding**: `addEventListener` on specific elements, not delegation (except pagination scroll)
- **CSS**: Use existing custom properties, follow BEM-ish class naming, add responsive media queries

### Avoid

- Modifying unrelated features when adding new functionality
- Introducing dependencies without explicit approval
- Changing backend API contracts
- Refactoring working code unless necessary for the task
- Adding global state or singleton patterns

## Things Claude MUST NOT Do

1. **Do not add React/Vue/Angular/TypeScript/Tailwind/Axios/any framework or library**
2. **Do not create a build step or bundler configuration**
3. **Do not implement client-side routing (SPA navigation) — pages are separate HTML files**
4. **Do not add WebSocket/SSE/polling for real-time features unless explicitly requested**
5. **Do not implement token refresh logic — current architecture has none**
6. **Do not add comment functionality — not in current scope**
7. **Do not implement search — UI exists but no backend integration**
8. **Do not change CSS architecture to CSS Modules or any methodology**
9. **Do not add a global state store**
10. **Do not modify `apiClient.js` signature or error handling without explicit request**
11. **Do not change pagination behavior (page sizes, thresholds, API params)**
12. **Do not remove or rename existing CSS classes used by JavaScript**
13. **Do not convert `FormData` uploads to JSON or vice versa**

## Known Issues / Inconsistencies

1. **No Token Refresh**: `refreshToken` stored but never used. On expiry, user gets 401 → logged out.
2. **Search Input Non-Functional**: Header search exists on all pages but no implementation.
3. **Reaction Buttons Non-Functional**: UI present but no handlers or API calls.
4. **Comment System Missing**: UI affordances (chat icon, commentCount) but no backend or frontend logic.
5. **Infinite Scroll No Debounce**: `scroll` listener fires on every event near threshold.
6. **Profile "Other User" Posts**: Loads 50 posts once and filters client-side — not paginated from API.
7. **Duplicate Card Rendering Logic**: `CreatePostFeedItem` (feed) vs `createPostCard` (profile tabs) vs `CreateNotificationCard` vs `CreateBookmarkCard` — similar but separate.
8. **Duplicate Follow Logic**: `handleFollowClick` in `index.js`, `notifications.js`, `profile.js` — similar but not shared.
9. **Duplicate Banner Implementation**: `showBanner` in `util/show.js` AND inline in `login.js` (different icon logic).
10. **Hardcoded API Base**: `https://localhost:7068/api` in `apiClient.js` — not configurable.
11. **No TypeScript/JSDoc**: No type definitions for API responses or function parameters.
```