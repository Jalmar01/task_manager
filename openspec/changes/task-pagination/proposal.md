# Proposal: Task List Pagination

## Intent

`GET /api/tasks` returns all user tasks unbounded. As task counts grow (hundreds/thousands), responses become oversized — wasting bandwidth, memory, and rendering time. Pagination bounds responses to a configurable page size, improving performance and UX.

## Scope

### In Scope
- Paginated `GET /api/tasks` with `page` and `limit` query params
- Zod validation for query params, refactoring `validate.js` to support `source` option
- Response format: `{ message, data, meta: { page, limit, total, totalPages } }`
- Defaults: `page=1`, `limit=20`; max `limit=100`
- Sort: `createdAt DESC` (consistent across pages)
- Tests for pagination behavior

### Out of Scope
- Filters (completed, search, priority, etc)
- Cursor-based pagination
- Sort configuration (field, direction)
- Rate limiting or caching

## Capabilities

> No existing specs in `openspec/specs/`. All capabilities are new.

### New Capabilities
- `task-list`: paginated task listing for the authenticated user, with page/limit params and response metadata

### Modified Capabilities
None

## Approach

1. **validation schema** — Add `getTasksSchema` to `task.validation.js` using `z.coerce.number()` to handle Express 5 string query params
2. **validate middleware** — Add optional `source` param (default `'body'`) so the same middleware supports query validation
3. **service layer** — Replace `Task.findAll()` with `Task.findAndCountAll()` accepting `offset`/`limit` params, ordered by `createdAt DESC`
4. **controller** — Read `req.query.page` / `req.query.limit`, pass to service, return `{ message, data, meta }`
5. **route** — Wire `validate(getTasksSchema, 'query')` to `GET /`
6. **tests** — Add cases for pagination metadata, defaults, max limit enforcement, and page boundaries

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/middlewares/validate.js` | Modified | Add `source` param to select `req.body` vs `req.query` |
| `src/modules/task/task.validation.js` | Modified | Add `getTasksSchema` with coerced page/limit |
| `src/modules/task/task.service.js` | Modified | `getTasks` → `findAndCountAll` with offset/limit/order |
| `src/modules/task/task.controller.js` | Modified | Read query params, build meta response |
| `src/modules/task/task.routes.js` | Modified | Add validate to GET `/` |
| `src/modules/task/task.test.js` | Modified | Add pagination test cases |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Express 5 returns query params as strings | High | Use `z.coerce.number()` in Zod schema |
| `findAndCountAll` executes 2 SQL queries | Medium | Acceptable for task volumes; can optimize later with COUNT as subquery |
| Inconsistent ordering across pages | Low | Enforce `createdAt DESC` — no user-configurable sort yet |
| Breaking existing clients expecting unbounded arrays | Medium | Backward-compatible: omitting `page`/`limit` returns page 1 with 20 items (was full list) |

## Rollback Plan

Revert all changes across the 6 affected files. The `validate.js` refactor preserves backward compatibility (default `source='body'`), so rolling back the middleware is safe regardless of order. If deployed incrementally, roll back route + controller + service first, then validation + middleware.

## Dependencies

None.

## Success Criteria

- [ ] `GET /api/tasks` returns meta with `page`, `limit`, `total`, `totalPages`
- [ ] `GET /api/tasks?page=2&limit=10` returns correct 10-task subset for page 2
- [ ] `GET /api/tasks?limit=200` caps limit at 100
- [ ] Defaults: `page=1`, `limit=20` when params omitted
- [ ] Order is always `createdAt DESC` across pages
- [ ] All existing tests pass; new pagination tests cover meta shape, defaults, cap, and boundaries
