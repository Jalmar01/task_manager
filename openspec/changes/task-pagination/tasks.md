# Tasks: Task List Pagination

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~120-150 |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending |

Decision needed before apply: Yes
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Low

## Phase 1: Foundation

- [x] **T1** — Modify `src/middlewares/validate.js`: add `source = 'body'` param, validate `req[source]`, replace `req[source]` on success. Depends on: none. Acceptance: existing body-validation routes pass; new routes can pass `'query'`.
- [x] **T2** — Add `getTasksSchema` to `src/modules/task/task.validation.js` with `z.coerce.number().int().positive().default(1)` for `page` and `z.coerce.number().int().positive().max(100).default(20)` for `limit`. Depends on: none. Acceptance: schema parses query strings, caps limit at 100, defaults page=1/limit=20.

## Phase 2: Core Implementation

- [x] **T3** — Update `getTasks(userId, page, limit)` in `src/modules/task/task.service.js`: compute `offset = (page - 1) * limit`, replace `findAll` with `findAndCountAll({ where: { userId }, offset, limit, order: [['createdAt', 'DESC']] })`, return `{ rows, count }`. Depends on: none. Acceptance: service returns `{ rows, count }` with paginated, newest-first results.
- [x] **T4** — Update `getTasks` in `src/modules/task/task.controller.js`: destructure `req.query.page/limit`, call `service.getTasks(userId, page, limit)`, respond `{ message, data, meta: { page, limit, total, totalPages } }`. Depends on: T2, T3. Acceptance: response includes meta envelope; empty pages return `data: []`.
- [x] **T5** — Wire `validate(getTasksSchema, 'query')` to `GET /` in `src/modules/task/task.routes.js`. Depends on: T1, T2, T4. Acceptance: query params are validated before reaching controller; invalid params return 400.

## Phase 3: Testing

- [x] **T6** — Add pagination tests to `src/modules/task/task.test.js`: seed 30-50 tasks, verify default pagination (20 items, meta), custom page/limit (tasks 21-30), limit cap (200→100), page beyond total (empty array), non-numeric page (400), negative limit (400), and newest-first order. Depends on: T5. Acceptance: all 7 scenarios pass with no regressions.
