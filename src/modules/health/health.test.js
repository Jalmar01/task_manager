const request = require('supertest');
const app = require('../../app');

describe('GET /api/health', () => {
    it('should return valid health response structure', async () => {
        const res = await request(app).get('/api/health');

        expect([200, 503]).toContain(res.status);
        expect(res.body).toHaveProperty('status');
        expect(res.body).toHaveProperty('timestamp');
        expect(res.body).toHaveProperty('uptime');
        expect(res.body).toHaveProperty('responseTimeMs');
        expect(res.body).toHaveProperty('database');
        expect(typeof res.body.uptime).toBe('number');
        expect(typeof res.body.responseTimeMs).toBe('number');
        expect(typeof res.body.timestamp).toBe('string');
        expect(['ok', 'degraded']).toContain(res.body.status);
        expect(['connected', 'error']).toContain(res.body.database);
    });

    it('should reflect db status consistently', async () => {
        const res = await request(app).get('/api/health');

        if (res.body.database === 'connected') {
            expect(res.status).toBe(200);
            expect(res.body.status).toBe('ok');
        } else {
            expect(res.status).toBe(503);
            expect(res.body.status).toBe('degraded');
        }
    });

    it('should include X-Request-Id header', async () => {
        const res = await request(app).get('/api/health');

        expect(res.headers['x-request-id']).toBeDefined();
        expect(res.headers['x-request-id']).toMatch(
            /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
        );
    });
});
