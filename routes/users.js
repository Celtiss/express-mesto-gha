const Router = require('express').Router();
const { getUsers, getUserById, createNewUser, updateUserInfo, updateUserAvatar } = require('../controllers/users');

Router.get('/', getUsers);
Router.get('/:userId', getUserById);
Router.post('/', createNewUser);
Router.patch('/me', updateUserInfo);
Router.patch('/me/avatar', updateUserAvatar);

module.exports = Router;