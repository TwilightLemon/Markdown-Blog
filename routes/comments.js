const express=require('express')
const router=express.Router()
const commentMng=require('../apis/commentMng')

router.post('/add',async (req,res)=>{
    if(req.query.type==="reply"){
        await commentMng.addComment(req.body.articleId,req.body.replyContent,req.cookies,req.body.commentId)
    } else await commentMng.addComment(req.body.articleId,req.body.comment,req.cookies)
    res.redirect('/articles/'+req.body.articleId)
})
router.delete('/:id',async (req,res)=>{
    await commentMng.deleteComment(req.body.articleId,req.params.id,req.cookies)
    res.redirect('back')
})
module.exports=router