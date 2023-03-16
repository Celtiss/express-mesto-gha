const express = require('express');
const { mongoose } = require('mongoose');
const bodyParser = require ('body-parser');
const { PORT = 3000 } = process.env;
// const path = require('path');
const users = require('./routes/users.js');
const cards = require('./routes/cards.js');
const app = express();
const NOTFOUND_CODE = 404;

mongoose.connect('mongodb://localhost:27017/mestodb', {
  useNewUrlParser: true,
})
.then(()=>console.log('connected'))
.catch(err => console.log(`Ошибка подключения базы данных: ${err}`));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use((req, res, next) => {
  req.user = {
    _id: '6411f03457f0efed2f21823c' // _id созданного пользователя
  };
  next();
});
app.use('/users', users);
app.use('/cards', cards);
app.use('*', (req, res) => {
  res.status(NOTFOUND_CODE).send({message: `Запрашиваемый ресурс не найден`});
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`)
})