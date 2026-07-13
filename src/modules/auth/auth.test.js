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

    describe('POST /api/auth/refresh', () => {
        it('should return 400 when refreshToken is missing', async () => {
            const res = await request(app)
                .post('/api/auth/refresh')
                .send({});

            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('error', 'Validation failed');
        });

        it('should return 401 when refreshToken is invalid', async () => {
            const res = await request(app)
                .post('/api/auth/refresh')
                .send({ refreshToken: 'invalid-token-here' });

            expect(res.status).toBe(401);
            expect(res.body).toHaveProperty('error', 'Invalid or expired refresh token');
        });

        it('should return 200 with new tokens when refreshToken is valid', async () => {
            // Register a user first
            const email = `refresh-test-${Date.now()}@test.com`;
            await request(app)
                .post('/api/auth/register')
                .send({ email, password: '123456', name: 'Refresh Test' });

            // Login to get tokens
            const loginRes = await request(app)
                .post('/api/auth/login')
                .send({ email, password: '123456' });

            expect(loginRes.status).toBe(200);
            expect(loginRes.body.data).toHaveProperty('refreshToken');

            const refreshToken = loginRes.body.data.refreshToken;

            // Use refresh token to get new tokens
            const refreshRes = await request(app)
                .post('/api/auth/refresh')
                .send({ refreshToken });

            expect(refreshRes.status).toBe(200);
            expect(refreshRes.body).toHaveProperty('message', 'Tokens refreshed');
            expect(refreshRes.body.data).toHaveProperty('accessToken');
            expect(refreshRes.body.data).toHaveProperty('refreshToken');
            expect(refreshRes.body.data.refreshToken).not.toBe(refreshToken);
        });
    });

    describe('POST /api/auth/logout', () => {
        it('should return 400 when refreshToken is missing', async () => {
            const res = await request(app)
                .post('/api/auth/logout')
                .send({});

            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('error', 'Validation failed');
        });

        it('should return 200 when logout succeeds', async () => {
            // Register a user first
            const email = `logout-test-${Date.now()}@test.com`;
            await request(app)
                .post('/api/auth/register')
                .send({ email, password: '123456', name: 'Logout Test' });

            // Login to get tokens
            const loginRes = await request(app)
                .post('/api/auth/login')
                .send({ email, password: '123456' });

            const refreshToken = loginRes.body.data.refreshToken;

            // Logout
            const logoutRes = await request(app)
                .post('/api/auth/logout')
                .send({ refreshToken });

            expect(logoutRes.status).toBe(200);
            expect(logoutRes.body).toHaveProperty('message', 'Logged out successfully');
        });

        it('should return 200 when logging out with already-used token (idempotent)', async () => {
            // Register a user first
            const email = `logout-idemp-${Date.now()}@test.com`;
            await request(app)
                .post('/api/auth/register')
                .send({ email, password: '123456', name: 'Logout Idemp' });

            // Login to get tokens
            const loginRes = await request(app)
                .post('/api/auth/login')
                .send({ email, password: '123456' });

            const refreshToken = loginRes.body.data.refreshToken;

            // First logout
            await request(app)
                .post('/api/auth/logout')
                .send({ refreshToken });

            // Second logout with same token — should still be 200
            const secondLogoutRes = await request(app)
                .post('/api/auth/logout')
                .send({ refreshToken });

            expect(secondLogoutRes.status).toBe(200);
            expect(secondLogoutRes.body).toHaveProperty('message', 'Logged out successfully');
        });
    });
});
