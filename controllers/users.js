const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const SUCCESS_CODE = 200;

const { BadReqError, UnauthorizedError, NotFoundError, ConflictError } = require('../errors/not-found-errors');

module.exports.login = (req, res, next) => {
  const {email, password} = req.body;
  return User.findUserByCredentials(email, password)
  .then((user) => {
    const token = jwt.sign({_id: user._id}, 'super-strong-secret', {expiresIn: '7d'});
    res.cookie('token', token, { maxAge: 3600000 * 24 * 7, httpOnly: true })
    .end();
  })
  .catch((err) => {next(new UnauthorizedError(`${err.message}`))});
};

// USERS
module.exports.getUsers = (req, res, next) => {
  User.find({})
    .then((users) => res.status(SUCCESS_CODE).send({ data: users }))
    .catch(next);
};

// USERS/ME
module.exports.getCurrentUser = (req, res, next) => {
  const userId = req.user;
  if (userId.length !== 24) {
    next(new BadReqError(`Введены некорректные данные при поиске пользователя с данным ID: ${userId}` ));
  }
  User.findById(userId)
    .orFail(() => {
      if (userId.length !== 24) {
        throw new NotFoundError(`Пользователь с данным id не найден:  ${userId}`);
      }
    })
    .then(((user) => res.status(SUCCESS_CODE).send({ data: user })))
    .catch(next);
}

// USERS/:ID
module.exports.getUserById = (req, res, next) => {
  const userId = req.params.userId;
  if (userId.length !== 24) {
    next(new BadReqError(`Введены некорректные данные при поиске пользователя с данным ID: ${userId}` ));
  }
  User.findById(userId)
    .orFail(() => {
      if (userId.length === 24) {
        throw new NotFoundError(`Пользователь с данным id не найден:  ${userId}`);
      }
    })
    .then(((user) => res.status(SUCCESS_CODE).send({ data: user })))
    .catch(next);
};

// USERS
module.exports.createNewUser = (req, res, next) => {
  const { name, about, avatar, email, password } = req.body;
  bcrypt.hash(password, 10)
  .then((hash) => {
    User.create({ name, about, avatar, email, password:hash, })
    .then((user) => res.status(SUCCESS_CODE).send({ data: user }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadReqError(`Введены некорректные данные при создании нового пользователя: ${err.message}`))
      }
      if(err.code === 11000) {
        next(new ConflictError(`Пользователь с данным email уже существует: ${err.message}`))
      }
      next(err);
    });
  })
};

// // USERS/ME
const updateUser = function (req, res, dataUser, next) {
  User.findByIdAndUpdate(req.user._id, dataUser, { new: true, runValidators: true })
    .orFail(() => {
      throw new NotFoundError(`Пользователь с данным id не найден:  ${req.user._id}`)
    })
    .then((user) => res.status(SUCCESS_CODE).send({ data: user }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadReqError(`Введены некорректные данные при обновлении пользователя: ${err.message}`));
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
