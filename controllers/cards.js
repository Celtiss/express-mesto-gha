const Card = require('../models/card');
const BADREQ_CODE = 400;
const NOTFOUND_CODE = 404;
const DEFAULT_CODE = 500;

module.exports.getCards = (req, res) => {
  Card.find({})
  .then(cards => res.send({data: cards}))
  .catch(err => res.status(DEFAULT_CODE).send({message: `Внутренняя ошибка сервера:  ${err.message}`}));
}

module.exports.createCard = (req, res) => {
  const {name, link} = req.body;
  const owner = req.user._id;
  Card.create({name, link, owner})
  .then(card => res.send({data: card}, {runValidators: true}))
  .catch(err => {
    if(err.name === 'ValidationError'){
      res.status(BADREQ_CODE).send({message: `Введены некорректные данные при создании новой карточки: ${err.message}`})
    }
    else{
      res.status(DEFAULT_CODE).send({message: `Внутренняя ошибка сервера:  ${err.message}`});
    }
  });
}

module.exports.deleteCard = (req, res) => {
  Card.findByIdAndDelete(req.params.cardId)
  .orFail(() => {
    res.status(NOTFOUND_CODE).send({message: `Карточка с данным id не найдена:  ${req.params.userId}`});
  })
  .then(() => res.send({message: 'Карточка успешко удалена'}))
  .catch(err => res.status(DEFAULT_CODE).send({message: `Внутренняя ошибка сервера:  ${err.message}`}));
}

module.exports.likeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
  .orFail(() => {
    res.status(NOTFOUND_CODE).send({message: `Карточка с данным id не найдена:  ${req.params.userId}`});
  })
  .then(() => res.send({message: 'Карточка успешко лайкнута'}))
  .catch(err => {
    if(err.name === 'ValidationError'){
      res.status(BADREQ_CODE).send({message: `Переданы некорректные данные для постановки лайка: ${err.message}`})
    }
    else{
      res.status(DEFAULT_CODE).send({message: `Внутренняя ошибка сервера:  ${err.message}`});
    }
  });
}

module.exports.dislikeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
  .orFail(() => {
    res.status(NOTFOUND_CODE).send({message: `Карточка с данным id не найдена:  ${req.params.userId}`});
  })
  .then(() => res.send({message: 'Успешно убран лайк с карточки'}))
  .catch(err => {
    if(err.name === 'ValidationError'){
      res.status(BADREQ_CODE).send({message: `Переданы некорректные данные для постановки дизлайка: ${err.message}`})
    }
    else{
      res.status(DEFAULT_CODE).send({message: `Внутренняя ошибка сервера:  ${err.message}`});
    }
  });
}

