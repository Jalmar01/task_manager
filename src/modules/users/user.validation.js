const { z } = require('zod');

const createUserSchema = z.object({
    email: z.string({ message: 'Email is required' }).email('Invalid email'),
    password: z
        .string({ message: 'Password is required' })
        .min(6, 'Password must be at least 6 characters'),
    name: z.string({ message: 'Name is required' }).min(1, 'Name is required')
});

module.exports = { createUserSchema };
