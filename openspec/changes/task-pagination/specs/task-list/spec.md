# task-list Specification

## Purpose

Task listing returns paginated, `createdAt`-descending tasks for the authenticated
user. Bounded responses carry metadata for client-side pagination controls.

## Requirements

### Requirement: Paginated task listing with defaults

The system MUST paginate `GET /api/tasks` with `page` (default 1) and `limit`
(default 20) when omitted. `limit` values over 100 MUST be rejected with 400. The response body MUST
match `{ message, data, meta: { page, limit, total, totalPages } }`.

#### Scenario: Default pagination

- GIVEN an authenticated user with 30 tasks
- WHEN they send `GET /api/tasks`
- THEN `data` MUST contain 20 tasks
- AND `meta` MUST equal `{ page: 1, limit: 20, total: 30, totalPages: 2 }`

#### Scenario: Custom page and limit

- GIVEN an authenticated user with 50 tasks
- WHEN they send `GET /api/tasks?page=3&limit=10`
- THEN `data` MUST return tasks 21–30
- AND `meta` MUST equal `{ page: 3, limit: 10, total: 50, totalPages: 5 }`

#### Scenario: Limit exceeds maximum

- GIVEN an authenticated user
- WHEN they send `GET /api/tasks?limit=200`
- THEN the response MUST be 400
- AND the response MUST indicate validation failure

#### Scenario: Empty page beyond total

- GIVEN an authenticated user with 5 tasks
- WHEN they send `GET /api/tasks?page=10`
- THEN `data` MUST be an empty array
- AND `meta` MUST equal `{ page: 10, limit: 20, total: 5, totalPages: 1 }`

### Requirement: Consistent sort order

The system MUST order tasks by `createdAt` descending across all pages. No other
sort orders are supported.

#### Scenario: Newest first

- GIVEN an authenticated user with tasks created on days 1, 2, and 3
- WHEN they request `GET /api/tasks?limit=2`
- THEN `data[0].createdAt` MUST be day 3

### Requirement: Query parameter validation

The system MUST validate `page` and `limit` via Zod using `z.coerce.number()`
to coerce Express 5 string query params.

#### Scenario: Non-numeric page

- GIVEN an authenticated user
- WHEN they send `GET /api/tasks?page=abc`
- THEN the response MUST be 400

#### Scenario: Negative limit

- GIVEN an authenticated user
- WHEN they send `GET /api/tasks?limit=-5`
- THEN the response MUST be 400

### Requirement: Validate middleware source option

The `validate` middleware MUST accept an optional `source` parameter defaulting
to `'body'` that selects `req.body` or `req.query` as the validation target.

#### Scenario: Query validation via source

- GIVEN the `GET /api/tasks` route registers `validate(getTasksSchema, 'query')`
- WHEN a request arrives
- THEN the middleware MUST validate `req.query` against `getTasksSchema`
- AND all existing body-validation routes MUST continue to work unchanged
