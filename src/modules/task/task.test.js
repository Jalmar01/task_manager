const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../../app');
const Task = require('./task.model');
const User = require('../users/user.model');
const setupAssociations = require('../../../database/associations');

const TEST_USER_ID = '00000000-0000-0000-0000-000000000000';
const TEST_USER_EMAIL = 'test@test.com';

const validToken = jwt.sign(
    { id: TEST_USER_ID, email: TEST_USER_EMAIL },
    process.env.JWT_SECRET || 'supersecretkey123',
    { expiresIn: '1h' }
);

function createTaskData(index) {
    const date = new Date(Date.UTC(2026, 0, 1) + index * 60000);
    return {
        id: `00000000-0000-0000-0000-${String(index).padStart(12, '0')}`,
        title: `Test task ${index}`,
        description: `Description ${index}`,
        completed: index % 2 === 0,
        userId: TEST_USER_ID,
        createdAt: date,
        updatedAt: date
    };
}

describe('Tasks API', () => {
    describe('POST /api/tasks', () => {
        it('should return 401 without token', async () => {
            const res = await request(app)
                .post('/api/tasks')
                .send({ title: 'Test task' });

            expect(res.status).toBe(401);
            expect(res.body).toHaveProperty('error', 'No token provided');
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

    describe('PATCH /api/tasks/:id', () => {
        it('should return 401 without token', async () => {
            const res = await request(app)
                .patch('/api/tasks/1')
                .send({ title: 'Updated' });

            expect(res.status).toBe(401);
            expect(res.body).toHaveProperty('error', 'No token provided');
        });

        it('should return 400 when no fields provided', async () => {
            const res = await request(app)
                .patch('/api/tasks/1')
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
            expect(res.body).toHaveProperty('error', 'No token provided');
        });
    });

    describe('DELETE /api/tasks/:id', () => {
        it('should return 401 without token', async () => {
            const res = await request(app).delete('/api/tasks/1');

            expect(res.status).toBe(401);
            expect(res.body).toHaveProperty('error', 'No token provided');
        });
    });

    describe('GET /api/tasks (pagination)', () => {
        const TOTAL_TASKS = 50;
        const TASK_IDS = Array.from({ length: TOTAL_TASKS }, (_, i) =>
            `00000000-0000-0000-0000-${String(i + 1).padStart(12, '0')}`
        );

        beforeAll(async () => {
            setupAssociations();

            await User.findOrCreate({
                where: { id: TEST_USER_ID },
                defaults: {
                    id: TEST_USER_ID,
                    name: 'Test User',
                    email: TEST_USER_EMAIL,
                    password: 'hashed',
                    provider: 'local'
                }
            });

            const tasks = [];
            for (let i = 1; i <= TOTAL_TASKS; i++) {
                tasks.push(createTaskData(i));
            }
            await Task.bulkCreate(tasks);
        });

        afterAll(async () => {
            await Task.destroy({ where: { userId: TEST_USER_ID } });
            await User.destroy({ where: { id: TEST_USER_ID } });
        });

        it('should return default pagination meta (page 1, limit 20)', async () => {
            const res = await request(app)
                .get('/api/tasks')
                .set('Authorization', `Bearer ${validToken}`);

            expect(res.status).toBe(200);
            expect(res.body.data).toHaveLength(20);
            expect(res.body.meta).toEqual({
                page: 1,
                limit: 20,
                total: TOTAL_TASKS,
                totalPages: 3
            });
        });

        it('should return custom page and limit meta with correct tasks', async () => {
            const res = await request(app)
                .get('/api/tasks?page=3&limit=10')
                .set('Authorization', `Bearer ${validToken}`);

            expect(res.status).toBe(200);
            expect(res.body.data).toHaveLength(10);
            expect(res.body.meta).toEqual({
                page: 3,
                limit: 10,
                total: TOTAL_TASKS,
                totalPages: 5
            });

            // DESC order → tasks 30, 29, ..., 21
            const expectedIds = TASK_IDS.slice(20, 30).reverse();
            const returnedIds = res.body.data.map((t) => t.id);
            expect(returnedIds).toEqual(expectedIds);
        });

        it('should reject limit exceeding 100', async () => {
            const res = await request(app)
                .get('/api/tasks?limit=200')
                .set('Authorization', `Bearer ${validToken}`);

            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('error', 'Validation failed');
        });

        it('should return empty array when page exceeds total pages', async () => {
            const res = await request(app)
                .get('/api/tasks?page=10')
                .set('Authorization', `Bearer ${validToken}`);

            expect(res.status).toBe(200);
            expect(res.body.data).toEqual([]);
            expect(res.body.meta).toEqual({
                page: 10,
                limit: 20,
                total: TOTAL_TASKS,
                totalPages: 3
            });
        });

        it('should return 400 for non-numeric page', async () => {
            const res = await request(app)
                .get('/api/tasks?page=abc')
                .set('Authorization', `Bearer ${validToken}`);

            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('error', 'Validation failed');
        });

        it('should return 400 for negative limit', async () => {
            const res = await request(app)
                .get('/api/tasks?limit=-5')
                .set('Authorization', `Bearer ${validToken}`);

            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('error', 'Validation failed');
        });

        it('should return tasks ordered by newest first', async () => {
            const res = await request(app)
                .get('/api/tasks?limit=2')
                .set('Authorization', `Bearer ${validToken}`);

            expect(res.status).toBe(200);
            expect(res.body.data).toHaveLength(2);

            // Newest task (index 49, id ends with 50) first
            expect(res.body.data[0].id).toBe(TASK_IDS[49]);
            expect(res.body.data[1].id).toBe(TASK_IDS[48]);
        });
    });
});
