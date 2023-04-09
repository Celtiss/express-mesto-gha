const { mongoose } = require('mongoose');
const bcrypt = require('bcryptjs');
const { UnauthorizedError } = require('../errors/UnauthorizedError');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: false,
    default: 'Жак-Ив Кусто',
    minlength: 2,
    maxlength: 30,
  },
  about: {
    type: String,
    required: false,
    default: 'Исследователь',
    minlength: 2,
    maxlength: 30,
  },
  avatar: {
    type: String,
    required: false,
    default: 'https://pictures.s3.yandex.net/resources/jacques-cousteau_1604399756.png',
  },
  email: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
});

userSchema.path('avatar').validate((val) => {
  const urlRegex = /^(https?:\/\/)?(www\.)?[a-zA-Z0-9\-._~:/?#\[\]@!\$&'()*+,;=]+(#)?$/;
  return urlRegex.test(val);
}, 'Invalid URL.');

userSchema.path('email').validate((val) => {
  const urlRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/;
  return urlRegex.test(val);
}, 'Invalid email.');

userSchema.statics.findUserByCredentials = function (email, password) {
  return this.findOne({ email })
    .then((user) => {
      if (!user) {
        return Promise.reject(new UnauthorizedError('Неправильные почта или пароль'));
      }
      console.log(password, user.password);
      return bcrypt.compare(password, user.password)
        .then((matched) => {
          if (!matched) {
            return Promise.reject(new UnauthorizedError('Неправильные почта или пароль'));
          }
          return user;
        });
    });
};

userSchema.methods.toJSON = function () {
  const data = this.toObject();
  delete data.password;
  delete data.__v;
  return data;
};

const user = mongoose.model('user', userSchema);
user.createIndexes();
module.exports = user;
