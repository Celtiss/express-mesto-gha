const Router = require('express').Router();
const {
  Joi, Segments, celebrate, errors,
} = require('celebrate');
const { default: mongoose } = require('mongoose');
const {
  getUsers, getUserById, getCurrentUser, updateUserInfo, updateUserAvatar,
} = require('../controllers/users');
const { BadReqError } = require('../errors/BadReqError');
const pattern = require('../regex');

Router.get('/', getUsers);
Router.get('/me', getCurrentUser);
Router.get('/:userId', celebrate({
  [Segments.PARAMS]: {
    userId: Joi.custom((v) => {
      if (!mongoose.isValidObjectId(v)) {
        throw new BadReqError('Invalid ID');
      }
      return v;
    }),
  },
}), getUserById);
Router.patch('/me', celebrate({
  [Segments.BODY]: {
    name: Joi.string().min(2).max(30),
    about: Joi.string().min(2).max(30)
  },

}), updateUserInfo);
Router.patch('/me/avatar', celebrate({
  [Segments.BODY]: {
    avatar: Joi.string().regex(pattern),
  },
}), updateUserAvatar);

module.exports = Router;
