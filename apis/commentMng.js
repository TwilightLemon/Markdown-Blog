const commentDB = require('../models/comment');
const auth = require('../apis/loginAuth');
const up = require('../apis/userProfile');
const {marked}=require('marked');
const cDom=require('dompurify');
const {JSDOM}=require('jsdom');
const dompurify=cDom(new JSDOM().window);

async function getArticleComments(articleId) {
    let comments = await commentDB.findOne({articleId: articleId});
    let commentsList = [];
    if (comments) {
        for (const comment of comments.comments) {

            commentsList.push({
                id: comment._id,
                email: comment.email,
                name: await up.getName(comment.email),
                comment: dompurify.sanitize(marked(comment.comment)),
                createdAt: comment.createdAt
            });
        }
    }
    return {comments: commentsList, likeCount: comments ? comments.likes.length : 0};
}

module.exports.getArticleComments = getArticleComments;

async function addComment(articleId, comment, cookies, replyTo = null) {
    if (await auth.checkLoginToken(cookies)) {
        let userId = cookies.email;
        let comments = await commentDB.findOne({articleId: articleId});
        let item = {email: userId, comment: comment, createdAt: Date.now()};
        if (comments) {
            if (replyTo != null) {
                //查找commendId为replyTo的评论
                let replyToIndex = 0;
                for (var i = 0; i < comments.comments.length; i++) {
                    if (comments.comments[i]._id.toString() === replyTo) {
                        replyToIndex = i;
                        break;
                    }
                }
                comments.comments.splice(i + 1, 0, item);
                item=comments.comments[i+1];
            } else {
                comments.comments.push(item);
                item=comments.comments[comments.comments.length-1];
            }
            await comments.save();
            item.comment= dompurify.sanitize(marked(item.comment));
            return item;
        } else {
            comments = new commentDB({
                articleId: articleId,
                comments: [item]
            });
            await comments.save();
            item=comments.comments[0];
            item.comment= dompurify.sanitize(marked(item.comment));
            return item;
        }
    }
    return null;
}

module.exports.addComment = addComment;

async function deleteComment(articleId, commentId, cookies) {
    if (await auth.checkLoginToken(cookies)) {
        let userId = cookies.email;
        let article = await commentDB.findOne({articleId: articleId});
        if (article) {
            let comments = article.comments;
            for (let i = 0; i < comments.length; i++) {
                if (comments[i]._id.toString() === commentId) {
                    if (comments[i].email === userId) {
                        comments.splice(i, 1);
                        await article.save();
                    }
                    if (comments.length === 0) {
                        article.deleteOne();
                    }
                    return true;
                }
            }
        }
    }
    return false;
}

module.exports.deleteComment = deleteComment;

async function clearCommentsForArticle(articleId, cookies) {
    let data = await auth.checkLoginToken(cookies);
    if (data) {
        let userId = data.user.email;
        let article = await commentDB.findOne({articleId: articleId});
        if (article) {
            article.deleteOne();
            return true;
        }
    }
    return false;
}
module.exports.clearCommentsForArticle=clearCommentsForArticle;

async function setLikesForArticle(articleId, cookies) {
    if (await auth.checkLoginToken(cookies)) {
        let userId = cookies.email;
        let article = await commentDB.findOne({articleId: articleId});
        let success = false;
        if (article) {
            let likes = article.likes;
            if (likes.includes(userId)) {
                likes.splice(likes.indexOf(userId), 1);
            } else {
                likes.push(userId);
            }
            await article.save();
            success = true;
        } else {
            article = new commentDB({
                articleId: articleId,
                likes: [userId]
            });
            await article.save();
            success = true;
        }

        if (success) {
            return article.likes.length;
        }
    }
    return -1;
}

module.exports.setLikesForArticle = setLikesForArticle;