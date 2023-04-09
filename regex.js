// const pattern = /^https?:\/\/(www.)?[-.:/?#@!$&%'()_+~,;=a-zA-Z0-9]+$/;

const pattern = (/(^(https?:\/\/)?(www\.)?[^\/\s]+\.[^\/\s]+(\/[^\/\s]*)*#?$)/);
module.exports = pattern;
