const HomeController = require('../controller/home');
const Router = require('koa-router');
const Home = new Router();

Home.get('/api/homes/slideshow', HomeController.getSlideShow);
Home.post('/api/homes/createarticle', HomeController.createArticle);

module.exports = Home