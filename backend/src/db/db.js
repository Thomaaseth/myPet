const mongoose = require('mongoose');

module.exports = {
    // Utility function to close database connection
    closeDatabase: async () => {
        await mongoose.disconnect();
    },
    // Utility function to clear database (useful for testing)
    clearDatabase: async () => {
        const collections = await mongoose.connection.db.collections();
        for (const collection of collections) {
            await collection.deleteMany({});
        }
    }
};