const Card = require('../models/card');

const BADREQ_CODE = 400;
const NOTFOUND_CODE = 404;
const DEFAULT_CODE = 500;
const SUCCESS_CODE = 200;

module.exports.getCards = (req, res) => {
  Card.find({})
    .then((cards) => res.status(SUCCESS_CODE).send({ data: cards }))
    .catch((err) => res.status(DEFAULT_CODE).send({ message: `На сервере произошла ошибка  ${err.message}` }));
};

module.exports.createCard = (req, res) => {
  const { name, link } = req.body;
  const owner = req.user._id;
  Card.create({ name, link, owner })
    .then((card) => res.status(SUCCESS_CODE).send({ data: card }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(BADREQ_CODE).send({ message: `Введены некорректные данные при создании новой карточки: ${err.message}` });
      } else {
        res.status(DEFAULT_CODE).send({ message: `На сервере произошла ошибка  ${err.message}` });
      }
    });
};

module.exports.deleteCard = (req, res) => {
  Card.findByIdAndDelete(req.params.cardId)
    .orFail(() => {
      if (req.params.cardId.length === 24) {
        res.status(NOTFOUND_CODE).send({ message: `Карточка с данным id не найдена:  ${req.params.userId}` });
      }
    })
    .then(() => res.status(SUCCESS_CODE).send({ message: 'Карточка успешко удалена' }))
    .catch((err) => {
      if (req.params.cardId.length !== 24) {
        res.status(BADREQ_CODE).send({ message: `Переданы некорректные данные при удалении карточки: ${err.message}` });
      } else {
        res.status(DEFAULT_CODE).send({ message: `На сервере произошла ошибка  ${err.message}` });
      }
    });
};

module.exports.likeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
    .orFail(() => {
      if (req.params.cardId.length === 24) {
        res.status(NOTFOUND_CODE).send({ message: `Карточка с данным id не найдена:  ${req.params.userId}` });
      }
    })
    .then(() => res.status(SUCCESS_CODE).send({ message: 'Карточка успешко лайкнута' }))
    .catch((err) => {
      if (req.params.cardId.length !== 24) {
        res.status(BADREQ_CODE).send({ message: `Переданы некорректные данные для постановки лайка: ${err.message}` });
      } else {
        res.status(DEFAULT_CODE).send({ message: `На сервере произошла ошибка  ${err.message}` });
      }
    });
};

module.exports.dislikeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
    .orFail(() => {
      res.status(NOTFOUND_CODE).send({ message: `Карточка с данным id не найдена:  ${req.params.userId}` });
    })
    .then(() => res.status(SUCCESS_CODE).send({ message: 'Успешно убран лайк с карточки' }))
    .catch((err) => {
      if (req.params.cardId.length !== 24) {
        res.status(BADREQ_CODE).send({ message: `Переданы некорректные данные для постановки дизлайка: ${err.message}` });
      } else {
        res.status(DEFAULT_CODE).send({ message: `На сервере произошла ошибка  ${err.message}` });
      }
    });
};
