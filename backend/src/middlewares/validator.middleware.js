export const validateProduct = (schema) => (req, res, next) => {
    try {
        schema.parse(req.body);
        next();
    } catch (error) {
        // Si hay error, devolvemos los mensajes de Zod
        const errorMessages = error.errors.map(err => ({
            path: err.path[0],
            message: err.message
        }));
        return res.status(400).json({ errors: errorMessages });
    }
};