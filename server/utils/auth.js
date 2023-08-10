const jwt = require('jsonwebtoken');

const secret = 'mysecretsshhhhh';
const expiration = '2h';

module.exports = {
  authMiddleware: function ({ req }) { 
    const token = req.headers.authorization;

    if (!token) {
      return { user: null };
    } // Add closing brace here

    try {
      const { data } = jwt.verify(token, secret, { maxAge: expiration });
      return { user: data }; 
    } catch {
      return { user: null }; 
    }
  },
  signToken: function ({ username, email, _id }) {
    const payload = { username, email, _id };

    return jwt.sign({ data: payload }, secret, { expiresIn: expiration });
  },
};
