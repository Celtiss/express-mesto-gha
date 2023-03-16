const User = require('../models/user');
const BADREQ_CODE = 400;
const NOTFOUND_CODE = 404;
const DEFAULT_CODE = 500;

module.exports.getUsers = (req, res) => {
  User.find({})
  .then(users =>res.send({data: users}))
  .catch(err => res.status(DEFAULT_CODE).send({message: `Внутренняя ошибка сервера:  ${err.message}`}));
}

module.exports.getUserById = (req, res) => {
  User.findById(req.params.userId)
  .orFail(() => {
    res.status(NOTFOUND_CODE).send({message: `Пользователь с данным id не найден:  ${req.params.userId}`});
  })
  .then((user => res.send({ data: user })))
  .catch(err => res.status(DEFAULT_CODE).send({message: `Внутренняя ошибка сервера:  ${err.message}`}));
}

module.exports.createNewUser = (req, res) => {
  const {name, about, avatar} = req.body;
  User.create({name, about, avatar}, {runValidators: true})
  .then(user => res.send({data:user}))
  .catch((err) => {
    if(err.name === 'ValidationError'){
      res.status(BADREQ_CODE).send({message: `Введены некорректные данные при создании нового пользователя: ${err.message}`})
    }
    else{
      res.status(DEFAULT_CODE).send({message: `Внутренняя ошибка сервера:  ${err.message}`});
    }
  });
}

module.exports.updateUserInfo = (req, res) => {
  const { name, about } = req.body;
  User.findByIdAndUpdate(req.user._id, { name, about }, {new: true, runValidators: true})
  .orFail(() => {
    res.status(NOTFOUND_CODE).send({message: `Пользователь с данным id не найден:  ${req.user._id}`});
  })
  .then(user => res.send({ data:user }))
  .catch((err) => {
    if(err.name === 'ValidationError'){
      res.status(BADREQ_CODE).send({message: `Введены некорректные данные при обновлении пользователя: ${err.message}`})
    }
    else{
      res.status(DEFAULT_CODE).send({message: `Внутренняя ошибка сервера:  ${err.message}`});
    }
  });
}

module.exports.updateUserAvatar = (req, res) => {
  const { avatar } = req.body;
  User.findByIdAndUpdate(req.user._id, { avatar }, {new: true, runValidators: true})
  .orFail(() => {
    res.status(NOTFOUND_CODE).send({message: `Пользователь с данным id не найден:  ${req.user._id}`});
  })
  .then(user => res.send({data:user}))
  .catch((err) => {
    if(err.name === 'ValidationError'){
      res.status(BADREQ_CODE).send({message: `Введены некорректные данные при обновлении аватара пользователя: ${err.message}`})
    }
    else{
      res.status(DEFAULT_CODE).send({message: `Внутренняя ошибка сервера:  ${err.message}`});
    }
  });
}