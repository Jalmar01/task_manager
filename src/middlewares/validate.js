const { z } = require('zod');

/**
 * Middleware de validación genérico usando Zod.
 * @param {z.ZodSchema} schema - Schema de Zod para validar req.body
 * @returns {Function} Middleware de Express
 */
function validate(schema) {
    return (req, res, next) => {
        const result = schema.safeParse(req.body);

        if (result.success) {
            // Reemplazar req.body con los datos parseados (incluye defaults)
            req.body = result.data;
            return next();
        }

        const details = result.error.issues.map((issue) => ({
            field: issue.path.join('.'),
            message: issue.message
        }));

        return res.status(400).json({
            error: 'Validation failed',
            details
        });
    };
}

module.exports = validate;
