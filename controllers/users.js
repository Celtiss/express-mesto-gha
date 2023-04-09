const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const { BadReqError } = require('../errors/BadReqError');
const { NotFoundError } = require('../errors/NotFoundError');
const { ConflictError } = require('../errors/ConflictError');

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;
  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, 'super-strong-secret', { expiresIn: '7d' });
      res.cookie('token', token, { maxAge: 3600000 * 24 * 7, httpOnly: true }).send({ user })
        .end();
    })
    .catch(next);
};

// USERS
module.exports.getUsers = (req, res, next) => {
  User.find({})
    .then((users) => res.send({ data: users }))
    .catch(next);
};

// USERS/ME
module.exports.getCurrentUser = (req, res, next) => {
  const userId = req.user._id;
  User.findById(userId)
    .orFail(() => {
      throw new NotFoundError(`Пользователь с данным id не найден:  ${userId}`);
    })
    .then(((user) => res.send({ data: user })))
    .catch(next);
};

// USERS/:ID
module.exports.getUserById = (req, res, next) => {
  const { userId } = req.params;
  User.findById(userId)
    .orFail(() => {
      throw new NotFoundError(`Пользователь с данным id не найден:  ${userId}`);
    })
    .then(((user) => res.send({ data: user })))
    .catch(next);
};

// USERS
module.exports.createNewUser = (req, res, next) => {
  const {
    name, about, avatar, email, password,
  } = req.body;
  bcrypt.hash(password, 10)
    .then((hash) => {
      User.create({
        name, about, avatar, email, password: hash,
      })
        .then((user) => res.send({ data: user }))
        .catch((err) => {
          if (err.name === 'ValidationError') {
            next(new BadReqError('Введены некорректные данные при создании нового пользователя'));
          }
          if (err.code === 11000) {
            next(new ConflictError(`Пользователь с данным email уже существует: ${email}`));
          }
          next(err);
        });
    })
    .catch(next);
};

// // USERS/ME
const updateUser = function (req, res, dataUser, next) {
  User.findByIdAndUpdate(req.user._id, dataUser, { new: true, runValidators: true })
    .orFail(() => {
      throw new NotFoundError(`Пользователь с данным id не найден:  ${req.user._id}`);
    })
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadReqError('Введены некорректные данные при обновлении пользователя'));
      } else {
        next(err);
      }
    });
};

module.exports.updateUserInfo = (req, res) => {
  const { name, about } = req.body;
  updateUser(req, res, { name, about });
};

module.exports.updateUserAvatar = (req, res) => {
  const { avatar } = req.body;
  updateUser(req, res, { avatar });
};
