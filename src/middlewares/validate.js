/**
 * Middleware de validación genérico usando Zod.
 * @param {import('zod').ZodSchema} schema - Schema de Zod para validar req[source]
 * @param {string} source - Fuente a validar ('body' | 'query'), default 'body'
 * @returns {Function} Middleware de Express
 */
function validate(schema, source = 'body') {
    return (req, res, next) => {
        const result = schema.safeParse(req[source]);

        if (result.success) {
            // Reemplazar req[source] con los datos parseados (incluye defaults)
            // Express 5 define req.query como getter sin setter, por lo que
            // req.query = value falla silenciosamente. Usamos defineProperty.
            Object.defineProperty(req, source, {
                value: result.data,
                writable: true,
                configurable: true,
                enumerable: true
            });
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
