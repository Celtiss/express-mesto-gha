const express = require('express');
const { mongoose } = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const {Joi, Segments, celebrate, errors} = require('celebrate');

const { PORT = 3000, DB_PATH = 'mongodb://localhost:27017/mestodb' } = process.env;
const users = require('./routes/users');
const cards = require('./routes/cards');
const {login, createNewUser} = require('./controllers/users');
const auth = require('./middlewares/auth');
const { NotFoundError } = require('./errors/not-found-errors');
const urlRegExp = new RegExp(/(^(https?:\/\/)?(www\.)?[^\/\s]+\.[^\/\s]+(\/[^\/\s]*)*#?$)/);

const app = express();

// Подключение к БД
mongoose.connect(DB_PATH, {
  useNewUrlParser: true,
})
  .then(() => console.log('connected'))
  .catch((err) => console.log(`Ошибка подключения базы данных: ${err}`));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// РЕГИСТРАЦИЯ
app.post('/signup', celebrate({
  [Segments.BODY]: {
    name: Joi.string().min(2).max(30),
    about: Joi.string().min(2).max(30),
    avatar: Joi.string().regex(urlRegExp),
    email: Joi.string().required().email(),
    password: Joi.string().required()}
}), createNewUser);

//АВТОРИЗАЦИЯ
app.post('/signin', celebrate({
  [Segments.BODY]: {
    email: Joi.string().required().email(),
    password: Joi.string().required()
  }
}), login);

//Защита роутов авторизацией
app.use(auth);
app.use('/users', users);
app.use('/cards', cards);
app.use('*', (req, res, next) => {
  return next(new NotFoundError('Запрашиваемый ресурс не найден'));
});

//ОБРАБОТКА ОШИБОК
app.use(errors());

app.use((err, req, res, next) => {
  const {statusCode = 500, message} = err;

  res.status(statusCode)
  .send({
    message: statusCode===500
    ?'На сервере произошла ошибка'
    :message
  });
})

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
