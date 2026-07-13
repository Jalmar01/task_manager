const { z } = require('zod');

const createTaskSchema = z.object({
    title: z.string().min(1, 'Title is required').max(100, 'Title must be at most 100 characters'),
    description: z.string().optional(),
    completed: z.boolean().default(false)
});

const updateTaskSchema = z
    .object({
        title: z.string().max(100, 'Title must be at most 100 characters').optional(),
        description: z.string().optional(),
        completed: z.boolean().optional()
    })
    .superRefine((data, ctx) => {
        if (
            data.title === undefined &&
            data.description === undefined &&
            data.completed === undefined
        ) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'At least one field must be provided',
                path: []
            });
        }
    });

const getTasksSchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().default(20).transform(v => Math.min(v, 100))
});

module.exports = { createTaskSchema, updateTaskSchema, getTasksSchema };
