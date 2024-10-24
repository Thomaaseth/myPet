const app = require('./app')
const mongoose = require('mongoose');

const PORT = process.env.PORT;

mongoose
    .connect(process.env.MONGODB_URI)
    .then(x => {
        console.log(`Connected to Mongo! Database name: "${x.connections[0].name}"`);
        
        // Only start server after DB connection
        app.listen(PORT, () => {
            console.log(`Server listening on http://localhost:${PORT}`);
        });
    })
    .catch(err => console.error('Error connecting to mongo: ', err));
