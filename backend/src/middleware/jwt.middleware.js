const { expressjwt: jwt } = require('express-jwt');

   const getTokenFromHeaders = (req) => {
       if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
          const token = req.headers.authorization.split(' ')[1];
          return token; 
       }
       return null;
   };

   const isAuthenticated = jwt({
       secret: process.env.TOKEN_SECRET,
       algorithms: ['HS256'],
       requestProperty: 'auth',
       getToken: getTokenFromHeaders
   });

   const setUser = (req, res, next) => {
       if (req.auth) {
           req.user = req.auth;
       }
       next();
   };

   module.exports = { 
       isAuthenticated: [isAuthenticated, setUser],
       getTokenFromHeaders
   };
   