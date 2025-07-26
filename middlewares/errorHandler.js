// middlewares/errorHandler.js

const { ValidationError, NotFoundError, DBError, UniqueViolationError } = require('objection');

module.exports = (err, req, res, next) => {
    
    console.error('❌ Server Error:', err);

    let status = err.status || 500;
    let message = 'Internal server error';

    // Handle Objection.js validation errors
    if (err instanceof ValidationError) {
        status = 422;
        message = 'Validation failed';

        const allErrors = err.data || {};

        // Extract the first error message only
        let firstMessage = 'Validation error';
        for (const field in allErrors) {
            if (allErrors[field] && allErrors[field][0]) {
                firstMessage = allErrors[field][0].message;
                break;
            }
        }

        return res.status(status).json({
            status,
            message: firstMessage,
            error:err.message
        });
    }

    // Handle not found error (e.g., model not found)
    if (err instanceof NotFoundError) {
        status = 404;
        message = 'Resource not found';
    }

    // Handle DB constraint violations (e.g., unique email)
    if (err instanceof UniqueViolationError) {
        status = 409;
        message = 'Duplicate entry';
    }

    // Handle other DB errors
    if (err instanceof DBError) {
        status = 400;
        message = 'Database error';
    }

    // Default error response
    res.status(status).json({
        status,
        message,
        error: err.message,
    });
};
