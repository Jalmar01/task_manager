const request = require('supertest');
const app = require('../../app');

describe('Users API', () => {
    describe('POST /api/users', () => {
        it('should return 400 when email is missing', async () => {
            const res = await request(app)
                .post('/api/users')
                .send({ password: '123456', name: 'Test' });

            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('error', 'Validation failed');
        });

        it('should return 400 when password is too short', async () => {
            const res = await request(app)
                .post('/api/users')
                .send({ email: 'test@test.com', password: '123', name: 'Test' });

            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('error', 'Validation failed');
        });
    });
});
