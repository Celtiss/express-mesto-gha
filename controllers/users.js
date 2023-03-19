const User = require('../models/user');

const BADREQ_CODE = 400;
const NOTFOUND_CODE = 404;
const DEFAULT_CODE = 500;
const SUCCESS_CODE = 200;

module.exports.getUsers = (req, res) => {
  User.find({})
    .then((users) => res.status(SUCCESS_CODE).send({ data: users }))
    .catch((err) => res.status(DEFAULT_CODE).send({ message: `На сервере произошла ошибка  ${err.message}` }));
};

module.exports.getUserById = (req, res) => {
  User.findById(req.params.userId)
    .orFail(() => {
      if (req.params.userId.length === 24) {
        res.status(NOTFOUND_CODE).send({ message: `Пользователь с данным id не найден:  ${req.params.userId}` });
      }
    })
    .then(((user) => res.status(SUCCESS_CODE).send({ data: user })))
    .catch((err) => {
      if (req.params.userId.length !== 24) {
        res.status(BADREQ_CODE).send({ message: `Введены некорректные данные при создании нового пользователя: ${err.message}` });
      } else {
        res.status(DEFAULT_CODE).send({ message: `На сервере произошла ошибка  ${err.message}` });
      }
    });
};

module.exports.createNewUser = (req, res) => {
  const { name, about, avatar } = req.body;
  User.create({ name, about, avatar })
    .then((user) => res.status(SUCCESS_CODE).send({ user }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(BADREQ_CODE).send({ message: `Введены некорректные данные при создании нового пользователя: ${err.message}` });
      } else {
        res.status(DEFAULT_CODE).send({ message: `На сервере произошла ошибка  ${err.message}` });
      }
    });
};

const updateUser = function (req, res, dataUser) {
  User.findByIdAndUpdate(req.user._id, dataUser, { new: true, runValidators: true })
    .orFail(() => {
      res.status(NOTFOUND_CODE).send({ message: `Пользователь с данным id не найден:  ${req.user._id}` });
    })
    .then((user) => res.status(SUCCESS_CODE).send({ data: user }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(BADREQ_CODE).send({ message: `Введены некорректные данные при обновлении пользователя: ${err.message}` });
      } else {
        res.status(DEFAULT_CODE).send({ message: `На сервере произошла ошибка  ${err.message}` });
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
