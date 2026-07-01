const request = require('supertest');
const app = require('../../app');

describe('Auth API', () => {
    describe('POST /api/auth/register', () => {
        it('should return 400 when email is missing', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({ password: '123456', name: 'Test' });

            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('error', 'Validation failed');
        });

        it('should return 400 when password is too short', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({ email: 'test@test.com', password: '123', name: 'Test' });

            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('error', 'Validation failed');
        });

        it('should return 400 when email is invalid', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({ email: 'not-an-email', password: '123456', name: 'Test' });

            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('error', 'Validation failed');
        });

        it('should return 400 when name is missing', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({ email: 'test@test.com', password: '123456' });

            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('error', 'Validation failed');
        });
    });

    describe('POST /api/auth/login', () => {
        it('should return 400 when email is missing', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({ password: '123456' });

            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('error', 'Validation failed');
        });

        it('should return 400 when password is missing', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({ email: 'test@test.com' });

            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('error', 'Validation failed');
        });

        it('should return 400 when email is invalid', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({ email: 'bademail', password: '123456' });

            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('error', 'Validation failed');
        });
    });

    describe('GET /api/auth/me', () => {
        it('should return 401 without token', async () => {
            const res = await request(app).get('/api/auth/me');

            expect(res.status).toBe(401);
            expect(res.body).toHaveProperty('error', 'No token provided');
        });

        it('should return 401 with invalid token', async () => {
            const res = await request(app)
                .get('/api/auth/me')
                .set('Authorization', 'Bearer invalid-token-here');

            expect(res.status).toBe(401);
            expect(res.body).toHaveProperty('error', 'Invalid or expired token');
        });

        it('should return 401 with malformed authorization header', async () => {
            const res = await request(app)
                .get('/api/auth/me')
                .set('Authorization', 'InvalidFormat');

            expect(res.status).toBe(401);
            expect(res.body).toHaveProperty('error', 'Invalid token format');
        });
    });
});
