const express = require('express');
const router = express.Router();
const commentMng = require('../apis/commentMng');

router.post('/add', async (req, res) => {
    let data;
    if (req.query.type === "reply") {
        data=await commentMng.addComment(req.body.articleId, req.body.replyContent, req.cookies, req.body.commentId,req.body.replyToId);
    } else data=await commentMng.addComment(req.body.articleId, req.body.comment, req.cookies);
    if(data.replyTo!==null)
        data.replyTo=await require('../apis/userProfile').getName(data.replyTo);
    res.json(data);
});
router.delete('/:id', async (req, res) => {
    let success=await commentMng.deleteComment(req.body.articleId, req.params.id, req.cookies);
    res.json({success: success});
});
router.post('/like', async (req, res) => {
    console.log(req.body.articleId, req.cookies);
    let counts = await commentMng.setLikesForArticle(req.body.articleId, req.cookies);
    res.setHeader('Content-Type', 'application/json')
        .status(200).json({likes: counts})
        .end();
});
module.exports = router;