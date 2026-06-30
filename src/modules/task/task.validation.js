const { z } = require('zod');

const createTaskSchema = z.object({
    title: z.string().min(1, 'Title is required').max(200, 'Title must be at most 200 characters'),
    description: z.string().optional(),
    completed: z.boolean().default(false)
});

const updateTaskSchema = z.object({
    title: z.string().max(200, 'Title must be at most 200 characters').optional(),
    description: z.string().optional(),
    completed: z.boolean().optional()
}).superRefine((data, ctx) => {
    if (data.title === undefined && data.description === undefined && data.completed === undefined) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'At least one field must be provided',
            path: []
        });
    }
});

module.exports = { createTaskSchema, updateTaskSchema };
