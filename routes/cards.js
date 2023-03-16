const Router = require('express').Router();
const { getCards, createCard, deleteCard, likeCard, dislikeCard } = require('../controllers/cards');

Router.get('/', getCards);
Router.post('/', createCard);
Router.delete('/:cardId', deleteCard);
Router.put('/:cardId/likes', likeCard);
Router.delete('/:cardId/likes', dislikeCard);

module.exports = Router;