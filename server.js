const express = require('express');
const mongoose = require('mongoose');
const Article = require('./models/article');
const articleRouter = require('./routes/articles');
const methodOverride = require('method-override');
const cookieParser = require('cookie-parser');
const auth = require('./apis/loginAuth');
const usProf = require('./apis/userProfile');
const globalService = require('./apis/globalService');
const app = express();

mongoose.connect('mongodb://localhost/blog', {
    useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true
});

app.set('view engine', 'ejs');
app.use(express.urlencoded({extended: false}));
app.use(methodOverride('_method'));
app.use(cookieParser());

globalService.setBingImgData();
app.get('/', async (req, res) => {
    const articles = await Article.find().sort({createdAt: 'desc'});
    for await (let e of articles) {
        e.authorName = await usProf.getName(e.author);
    }
    res.render('articles/index', await auth.packConfWith(req.cookies, {articles: articles}));
});

app.use('/articles', articleRouter);
app.use('/comments', require('./routes/comments'));
app.use('/login', require('./routes/login'));
app.use('/profile', require('./routes/profile'));

app.listen(8888);