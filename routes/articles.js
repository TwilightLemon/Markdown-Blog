const express = require('express')
const Article = require('./../models/article')
const auth = require("../apis/loginAuth");
const router = express.Router()
const commentMng=require('../apis/commentMng')
const mongoose = require("mongoose");

router.get('/new', async (req, res) => {
  res.render('articles/new', await auth.packConfWith(req.cookies,{article: new Article()}))
})

router.get('/edit/:id', async (req, res) => {
  const article = await Article.findById(req.params.id)
  res.render('articles/edit', await auth.packConfWith(req.cookies,{ article: article }))
})

router.get('/:id', async (req, res) => {
  const article = await Article.findById(req.params.id)

  if (article==null) {res.redirect('/') }
  else {
    let commentsData = await commentMng.getArticleComments(article._id)
    let likeCount=commentsData.likeCount
    res.render('articles/show', await auth.packConfWith(req.cookies, {article: article, comments: commentsData.comments,likes:likeCount}))
  }
})

router.post('/', async (req, res, next) => {
  req.article = new Article()
  next()
}, saveArticleAndRedirect('new'))

router.put('/:id', async (req, res, next) => {
  req.article = await Article.findById(req.params.id)
  next()
}, saveArticleAndRedirect('edit'))

router.delete('/:id', async (req, res) => {
  await Article.findByIdAndDelete(req.params.id)
  res.redirect('/')
})

function saveArticleAndRedirect(path) {
  return async (req, res) => {
    if(await auth.checkLoginToken(req.cookies)) {
      let article = req.article
      article.title = req.body.title
      article.description = req.body.description
      article.markdown = req.body.markdown
      article.author = req.cookies.email
      article.authorName = req.cookies.name
      try {
        article = await article.save()
        res.redirect(`/articles/${article.id}`)
      } catch (e) {
        res.render(`articles/${path}`, await auth.packConfWith(req.cookies, {article: article}))
      }
    }
  }
}

module.exports = router