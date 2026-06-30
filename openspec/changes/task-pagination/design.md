# Design: Task List Pagination

## Technical Approach

Extend the existing layered architecture (Routes → Controller → Service → Model) to support offset/limit pagination on `GET /api/tasks`. The `validate` middleware gains a `source` parameter to validate either `req.body` or `req.query`. The service replaces `Task.findAll` with `Task.findAndCountAll`. The controller enriches the response with a `meta` object. No new dependencies or structural changes.

## Architecture Decisions

| Decision | Options | Choice | Rationale |
|----------|---------|--------|-----------|
| Pagination method | offset/limit vs cursor | **offset/limit** | Simpler, sufficient for current volumes. Cursor adds complexity with no need |
| Source routing | Separate middleware vs single with param | **Single with `source` param** | Preserves existing patterns, zero duplication. Default `'body'` ensures backward compat |
| Type coercion | Manual `parseInt` vs Zod coerce | **`z.coerce.number()`** | Express 5 query params are strings. Coerce handles this declaratively at the schema layer |
| Response format | Flat vs meta envelope | **`{ message, data, meta }`** | Meta carries page/limit/total/totalPages for client controls. No existing clients to break? Risk noted in proposal |
| Query method | Raw SQL vs `findAndCountAll` | **Sequelize `findAndCountAll`** | Uses existing ORM, returns `{ rows, count }`. 2 SQL queries (COUNT + SELECT), acceptable |

## Data Flow

```
Client                  Routes/Validate               Controller              Service               Sequelize
 │                             │                          │                       │                      │
 │ GET /api/tasks?page=2       │                          │                       │                      │
 │   &limit=10                 │                          │                       │                      │
 │ ──────────────────────────► │                          │                       │                      │
 │                             │ validate(schema,'query') │                       │                      │
 │                             │ Zod coerces, defaults    │                       │                      │
 │                             │ ───────────────────────► │                       │                      │
 │                             │                          │ getTasks(id,2,10)     │                      │
 │                             │                          │ ──────────────────►   │                      │
 │                             │                          │                       │ findAndCountAll(     │
 │                             │                          │                       │   offset:10,limit:10,│
 │                             │                          │                       │   order: createdAt   │
 │                             │                          │                       │   DESC)              │
 │                             │                          │                       │ ──────────────────►  │
 │                             │                          │                       │ ◄── {rows, count} ── │
 │                             │                          │ ◄── {rows, count} ─── │                      │
 │                             │                          │ compute meta          │                      │
 │                             │ ◄──── json(data,meta) ── │                       │                      │
 │ ◄─── {msg, data, meta} ──── │                          │                       │                      │
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/middlewares/validate.js` | Modify | Add `source = 'body'` param, parse `req[source]` instead of `req.body` |
| `src/modules/task/task.validation.js` | Modify | Add `getTasksSchema` with coerced page/limit |
| `src/modules/task/task.service.js` | Modify | Replace `findAll` with `findAndCountAll`, offset/limit/order |
| `src/modules/task/task.controller.js` | Modify | Read query params, compute meta, return paginated response |
| `src/modules/task/task.routes.js` | Modify | Wire `validate(getTasksSchema, 'query')` on `GET /` |
| `src/modules/task/task.test.js` | Modify | Add pagination test scenarios |

## Interfaces / Contracts

### validate.js — source param

```js
function validate(schema, source = 'body') {
    return (req, res, next) => {
        const result = schema.safeParse(req[source]);
        // if success → replace req[source] (was req.body) with parsed data
        // if fail → 400 with details
    };
}
```

### getTasksSchema

```js
const getTasksSchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20)
});
```

### Service signature

```js
async function getTasks(userId, page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const { rows, count } = await Task.findAndCountAll({
        where: { userId },
        offset,
        limit,
        order: [['createdAt', 'DESC']]
    });
    return { rows, count };
}
```

### Controller response

```js
res.status(200).json({
    message: 'Tasks fetched',
    data: rows,
    meta: { page, limit, total: count, totalPages: Math.ceil(count / limit) }
});
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Integration | Default pagination (20 items, page 1) | Supertest with DB seed of 30 tasks |
| Integration | Custom page/limit (page 3, limit 10) | Verify tasks 21–30, meta={3,10,50,5} |
| Integration | Limit cap at 100 (limit=200 → 100) | Assert meta.limit === 100 |
| Integration | Empty page beyond total (page 10, 5 tasks) | Assert data=[], meta.page=10, total=5, totalPages=1 |
| Integration | Non-numeric page (page=abc) → 400 | Assert validation error |
| Integration | Negative limit (limit=-5) → 400 | Assert validation error |
| Integration | Order (newest first, limit=2) | Assert data[0] is most recent |
| Regression | 401 without token (unchanged) | Existing test must still pass |

## Migration / Rollout

No migration required. Backward-compatible at API level — omitted params default to page=1, limit=20. Existing tests continue passing.

## Open Questions

None.
