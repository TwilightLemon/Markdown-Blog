const express = require('express');
const Article = require('./../models/article');
const auth = require("../apis/loginAuth");
const router = express.Router();
const commentMng = require('../apis/commentMng');
const mongoose = require("mongoose");
const createDomPurify = require("dompurify");
const {JSDOM} = require("jsdom");

router.get('/new', async (req, res) => {
    res.render('articles/new', await auth.packConfWith(req.cookies, {article: new Article()}));
});

router.get('/edit/:id', async (req, res) => {
    const article = await Article.findById(req.params.id);
    res.render('articles/edit', await auth.packConfWith(req.cookies, {article: article}));
});

router.get('/:id', async (req, res) => {
    const article = await Article.findById(req.params.id);

    if (article == null) {
        res.redirect('/');
    } else {
        let commentsData = await commentMng.getArticleComments(article._id);
        let likeCount = commentsData.likeCount;

        const {marked} = require('marked');
        const createDomPurify = require('dompurify');
        const {JSDOM} = require('jsdom');
        const dompurify = createDomPurify(new JSDOM().window);
        const usProf = require('../apis/userProfile');
        article.sanitizedHtml = dompurify.sanitize(marked(article.markdown));
        article.authorName = await usProf.getName(article.author);
        res.render('articles/show', await auth.packConfWith(req.cookies, {
            article: article,
            comments: commentsData.comments,
            likes: likeCount
        }));
    }
});

router.post('/', async (req, res, next) => {
    req.article = new Article();
    next();
}, saveArticleAndRedirect('new'));

router.put('/:id', async (req, res, next) => {
    req.article = await Article.findById(req.params.id);
    next();
}, saveArticleAndRedirect('edit'));

router.delete('/:id', async (req, res) => {
    let authData = await auth.checkLoginToken(req.cookies);
    if (authData) {
        await Article.findByIdAndDelete(req.params.id);
        await commentMng.clearCommentsForArticle(req.params.id,req.cookies);
        res.redirect('/');
    }
});

function saveArticleAndRedirect(path) {
    return async (req, res) => {
        let authData = await auth.checkLoginToken(req.cookies);
        if (authData) {
            let article = req.article;
            article.title = req.body.title;
            article.description = req.body.description;
            article.markdown = req.body.markdown;
            article.author = authData.user.email;
            try {
                article = await article.save();
                res.redirect(`/articles/${article.id}`);
            } catch (e) {
                res.render(`articles/${path}`, await auth.packConfWith(req.cookies, {article: article}));
            }
        }
    };
}

module.exports = router;