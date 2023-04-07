const Card = require('../models/card');

const SUCCESS_CODE = 200;
const { BadReqError, ForbiddenError, NotFoundError } = require('../errors/not-found-errors');

module.exports.getCards = (req, res, next) => {
  Card.find({})
    .then((cards) => res.status(SUCCESS_CODE).send({ data: cards }))
    .catch(next);
};

module.exports.createCard = (req, res, next) => {
  const { name, link } = req.body;
  const owner = req.user;
  console.log(owner);
  Card.create({ name, link, owner })
    .then((card) => res.status(SUCCESS_CODE).send({ data: card }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadReqError(`Введены некорректные данные при создании новой карточки: ${err.message}`));
      } else {
        next(err);
      }
    });
};

module.exports.deleteCard = (req, res, next) => {
  const cardId = req.params.cardId;
  if (cardId.length !== 24) {
    next(new BadReqError(`Переданы некорректные данные при удалении карточки: ${err.message}`))
  }
  Card.findById(cardId)
    .orFail(() => {
      if (cardId.length === 24) {
        throw new NotFoundError(`Карточка с данным id не найдена:  ${cardId}`);
      }
    })
    .then((card) => {
        if(card.owner == req.user._id) {
          Card.findByIdAndDelete(cardId)
          .orFail(() => {
            if (cardId.length === 24) {
              throw new NotFoundError(`Карточка с данным id не найдена:  ${cardId}`);
            }
          })
          .then(() => res.status(SUCCESS_CODE).send({ message: 'Карточка успешко удалена' }))
          .catch(next);
        }
        else{
          throw new ForbiddenError('Нельзя удалять чужую карточку')
        }
    })
    .catch(next);
};

module.exports.likeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
    .orFail(() => {
      if (req.params.cardId.length === 24) {
        throw(new NotFoundError(`Карточка с данным id не найдена:  ${req.params.cardId}`));
      }
    })
    .then(() => res.status(SUCCESS_CODE).send({ message: 'Карточка успешко лайкнута' }))
    .catch((err) => {
      if (req.params.cardId.length !== 24) {
        next(new BadReqError(`Переданы некорректные данные для постановки лайка: ${err.message}`));
      } else {
        next(err);
      }
    });
};

module.exports.dislikeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
    .orFail(() => {
      throw(new NotFoundError(`Карточка с данным id не найдена:  ${req.params.cardId}`));
    })
    .then(() => res.status(SUCCESS_CODE).send({ message: 'Успешно убран лайк с карточки' }))
    .catch((err) => {
      if (req.params.cardId.length !== 24) {
        next(new BadReqError(`Переданы некорректные данные для постановки лайка: ${err.message}`));
      } else {
        next(err);
      }
    });
};
