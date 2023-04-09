const Card = require('../models/card');

const { BadReqError } = require('../errors/BadReqError');
const { ForbiddenError } = require('../errors/ForbiddenError');
const { NotFoundError } = require('../errors/NotFoundError');

module.exports.getCards = (req, res, next) => {
  Card.find({})
    .then((cards) => res.send({ data: cards }))
    .catch(next);
};

module.exports.createCard = (req, res, next) => {
  const { name, link } = req.body;
  const owner = req.user;
  console.log(owner);
  Card.create({ name, link, owner })
    .then((card) => res.send({ data: card }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadReqError('Введены некорректные данные при создании новой карточки'));
      } else {
        next(err);
      }
    });
};

module.exports.deleteCard = (req, res, next) => {
  const { cardId } = req.params;
  Card.findById(cardId)
    .orFail(() => {
      throw new NotFoundError(`Карточка с данным id не найдена:  ${cardId}`);
    })
    .then((card) => {
      if (card.owner === req.user._id) {
        Card.findByIdAndDelete(cardId)
          .orFail(() => {
            throw new NotFoundError(`Карточка с данным id не найдена:  ${cardId}`);
          })
          .then(() => res.send({ message: 'Карточка успешко удалена' }))
          .catch(next);
      } else {
        throw new ForbiddenError('Нельзя удалять чужую карточку');
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
      throw (new NotFoundError(`Карточка с данным id не найдена:  ${req.params.cardId}`));
    })
    .then(() => res.send({ message: 'Карточка успешко лайкнута' }))
    .catch(next);
};

module.exports.dislikeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
    .orFail(() => {
      throw (new NotFoundError(`Карточка с данным id не найдена:  ${req.params.cardId}`));
    })
    .then(() => res.send({ message: 'Успешно убран лайк с карточки' }))
    .catch(next);
};
