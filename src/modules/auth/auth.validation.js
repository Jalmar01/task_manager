const { z } = require('zod');

const registerSchema = z.object({
    email: z.string({ message: 'Email is required' }).email('Invalid email'),
    password: z
        .string({ message: 'Password is required' })
        .min(6, 'Password must be at least 6 characters'),
    name: z.string({ message: 'Name is required' }).min(1, 'Name is required')
});

const loginSchema = z.object({
    email: z.string({ message: 'Email is required' }).email('Invalid email'),
    password: z.string({ message: 'Password is required' }).min(1, 'Password is required')
});

const refreshSchema = z.object({
    refreshToken: z.string({ message: 'Refresh token is required' }).min(1, 'Refresh token is required')
});

module.exports = { registerSchema, loginSchema, refreshSchema };
