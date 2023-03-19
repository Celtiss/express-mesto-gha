const express = require('express');
const { mongoose } = require('mongoose');
const bodyParser = require('body-parser');

const { PORT = 3000, DB_PATH = 'mongodb://localhost:27017/mestodb' } = process.env;
const users = require('./routes/users');
const cards = require('./routes/cards');

const app = express();
const NOTFOUND_CODE = 404;

mongoose.connect(DB_PATH, {
  useNewUrlParser: true,
})
  .then(() => console.log('connected'))
  .catch((err) => console.log(`Ошибка подключения базы данных: ${err}`));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use((req, res, next) => {
  req.user = {
    _id: '6411f03457f0efed2f21823c', // _id созданного пользователя
  };
  next();
});
app.use('/users', users);
app.use('/cards', cards);
app.use('*', (req, res) => {
  res.status(NOTFOUND_CODE).send({ message: 'Запрашиваемый ресурс не найден' });
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
