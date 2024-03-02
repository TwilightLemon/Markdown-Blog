const commentDB=require('../models/comment')
const auth=require('../apis/loginAuth')
const up=require('../apis/userProfile')

async function getArticleComments(articleId){
    let comments=await commentDB.findOne({articleId:articleId})
    let commentsList=[]
    if(comments){
        for (const comment of comments.comments) {
            commentsList.push({id:comment._id,
                email:comment.email,
                name:await up.getName(comment.email),
                comment:comment.comment,
                createdAt:comment.createdAt
            })
        }
    }
    return commentsList
}
module.exports.getArticleComments=getArticleComments

async function addComment(articleId,comment,cookies,replyTo=null){
    if(await auth.checkLoginToken(cookies)) {
        let userId = cookies.email
        let comments = await commentDB.findOne({articleId: articleId})
        let item={email: userId, comment: comment,createdAt:Date.now()}
        if (comments) {
            if(replyTo!=null){
                //查找commendId为replyTo的评论
                let replyToIndex=0
                for (var i=0;i<comments.comments.length;i++){
                    if(comments.comments[i]._id.toString()===replyTo){
                        replyToIndex=i
                        break
                    }
                }
                comments.comments.splice(i+1,0, item)
            }
            else comments.comments.push(item)
            await comments.save()
        } else {
            comments = new commentDB({
                articleId: articleId,
                comments: [item]
            })
            await comments.save()
        }
    }
}
module.exports.addComment=addComment

async function deleteComment(articleId,commentId,cookies){
    if(await auth.checkLoginToken(cookies)) {
        let userId = cookies.email
        let article=await commentDB.findOne({articleId:articleId})
        if(article){
            let comments=article.comments
            for (let i=0;i<comments.length;i++){
                if(comments[i]._id.toString()===commentId){
                    if(comments[i].email===userId){
                        comments.splice(i,1)
                        await article.save()
                    }
                    break
                }
            }
        }
    }
}
module.exports.deleteComment=deleteComment
