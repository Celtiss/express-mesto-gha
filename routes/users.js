const Router = require('express').Router();
const {Joi, Segments, celebrate, errors} = require('celebrate');
const {
  getUsers, getUserById, getCurrentUser, updateUserInfo, updateUserAvatar
} = require('../controllers/users');

Router.get('/', getUsers);
Router.get('/me', getCurrentUser);
Router.get('/:userId', getUserById);
Router.patch('/me', updateUserInfo);
Router.patch('/me/avatar', updateUserAvatar);

module.exports = Router;
