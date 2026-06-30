const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../../app');

const validToken = jwt.sign(
    { id: '00000000-0000-0000-0000-000000000000', email: 'test@test.com' },
    process.env.JWT_SECRET || 'supersecretkey123',
    { expiresIn: '1h' }
);

describe('Tasks API', () => {
    describe('POST /api/tasks', () => {
        it('should return 401 without token', async () => {
            const res = await request(app)
                .post('/api/tasks')
                .send({ title: 'Test task' });

            expect(res.status).toBe(401);
            expect(res.body).toHaveProperty('message', 'No token provided');
        });

        it('should return 400 when title is missing', async () => {
            const res = await request(app)
                .post('/api/tasks')
                .set('Authorization', `Bearer ${validToken}`)
                .send({});

            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('error', 'Validation failed');
        });

        it('should return 400 when title is too long', async () => {
            const res = await request(app)
                .post('/api/tasks')
                .set('Authorization', `Bearer ${validToken}`)
                .send({ title: 'x'.repeat(201) });

            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('error', 'Validation failed');
        });
    });

    describe('PUT /api/tasks/:id', () => {
        it('should return 401 without token', async () => {
            const res = await request(app)
                .put('/api/tasks/1')
                .send({ title: 'Updated' });

            expect(res.status).toBe(401);
            expect(res.body).toHaveProperty('message', 'No token provided');
        });

        it('should return 400 when no fields provided', async () => {
            const res = await request(app)
                .put('/api/tasks/1')
                .set('Authorization', `Bearer ${validToken}`)
                .send({});

            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('error', 'Validation failed');
        });
    });

    describe('GET /api/tasks', () => {
        it('should return 401 without token', async () => {
            const res = await request(app).get('/api/tasks');

            expect(res.status).toBe(401);
            expect(res.body).toHaveProperty('message', 'No token provided');
        });
    });

    describe('DELETE /api/tasks/:id', () => {
        it('should return 401 without token', async () => {
            const res = await request(app).delete('/api/tasks/1');

            expect(res.status).toBe(401);
            expect(res.body).toHaveProperty('message', 'No token provided');
        });
    });
});
