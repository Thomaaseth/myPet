const logger = require('morgan');
const cookieParser = require('cookie-parser');

module.exports = (app) => {
    app.set('trust proxy', 1);
    app.use(logger('dev'));
    app.use(cookieParser());
};