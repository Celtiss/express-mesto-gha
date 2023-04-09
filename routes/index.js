const Router = require('express').Router();
const {
  Joi, Segments, celebrate,
} = require('celebrate');

const users = require('./users');
const cards = require('./cards');
const pattern = require('../regex');
const { login, createNewUser } = require('../controllers/users');
const auth = require('../middlewares/auth');
const { NotFoundError } = require('../errors/NotFoundError');
// РЕГИСТРАЦИЯ
Router.post('/signup', celebrate({
  [Segments.BODY]: {
    name: Joi.string().min(2).max(30),
    about: Joi.string().min(2).max(30),
    avatar: Joi.string().regex(pattern),
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  },
}), createNewUser);

// АВТОРИЗАЦИЯ
Router.post('/signin', celebrate({
  [Segments.BODY]: {
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  },
}), login);

// Защита роутов авторизацией
Router.use(auth);
Router.use('/users', users);
Router.use('/cards', cards);
Router.use('*', (req, res, next) => next(new NotFoundError('Запрашиваемый ресурс не найден')));

module.exports = Router;
