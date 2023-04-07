const jwt = require('jsonwebtoken');
const { UnauthorizedError } = require('../errors/not-found-errors');
const { unlock } = require('../routes/users');

module.exports = (req, res, next) => {
  const token = req.cookies.token;
  if(!token) {
    throw new UnauthorizedError('Необходима авторизация');
  }
  // верифицируем токен
  let payload;
  try {
    payload = jwt.verify(token, 'super-strong-secret');
    console.log(payload);
  }
  catch (err) {
    next(err);
  }
  req.user = payload;

  next();
}