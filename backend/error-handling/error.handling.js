module.exports = (app) => {
    // Handle 404
    app.use((req, res, next) => {
        res.status(404).json({ message: 'This route does not exist' });
    });

    // Handle errors
    app.use((err, req, res, next) => {
        // Only log real errors, not authentication failures
        if (err.name !== 'UnauthorizedError') {
            console.error('Error:', {
                route: `${req.method} ${req.path}`,
                error: err.message,
                stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
            });
        }
        // Handle JWT/Auth errors
        if (err.name === 'UnauthorizedError') {
            return res.status(401).json({ 
                message: err.inner?.message || 'Authentication required'
            });
        }

        if (!res.headersSent) {
            res.status(500).json({
                message: 'Internal server error. Check the server console'
            });
        }
    });
};