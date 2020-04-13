const mongoCollections = require('../config/mongoCollections');
const comments = mongoCollections.comments;
const users = require('./users');
const moments = require("./moments");
const {ObjectId} = require('mongodb');

async function addComments(momentId, comment) {
    if (typeof momentId !== 'string' || !momentId) throw `No user provided or wrong input type`;
    if (typeof comment !== 'string' || !comment) throw `No comment provided or wrong input type`;

    const target = await moments.getMomentById(momentId);
    const commentCollection = await comments();
    const newComment = {
        targetMoment: target._id,
        comment: comment
    };

    const newInsertInformation = await commentCollection.insertOne(newComment);
    const newId = newInsertInformation.insertedId;
    const newObj = await getCommentById(newId.toString());
    await moments.addCommentsToMoments(momentId, newObj);
    return newObj;

}
//addComments("5e94b148869ca2b43f0ad425","test10000");
async function getCommentById(id) {
    const objId = ObjectId.createFromHexString(id);

    const commentCollection = await comments();
    const comment = await commentCollection.findOne({_id: objId});

    if (!comment) throw 'Comment not found';
    return comment;
}

async function getAllComments() {
    const commentCollection = await comments();
    return await commentCollection.find({}).toArray();
}

async function removeComment(id) {
    const commentCollection = await comments();
    let comment = null;
    try {
        comment = await getCommentById(id);
    } catch (e) {
        console.log(e);
        return;
    }
    await moments.removeCommentsFromMoments(comment.targetMoment.toString(), id);
    const objId = ObjectId.createFromHexString(id);

    const deletionInfo = await commentCollection.removeOne({_id: objId});
    if (deletionInfo.deletedCount === 0) {
        throw `Could not delete comment with id of ${id}`;
    }
    return true;
}
//removeComment("5e94b5e0d5762eb49bb4ca8e");
async function updateComment(id, newComment) {
    const commentCollection = await comments();

    if (!newComment) {
        throw `Please provide a new comment to update this comment`;
    }
    const oldOne = await getCommentById(id);
    const updatedCommentData = {};

    updatedCommentData.targetMoment = oldOne.targetMoment;
    updatedCommentData.comment = newComment;

    const objId = ObjectId.createFromHexString(id);

    await commentCollection.updateOne({_id: objId}, {$set: updatedCommentData});

    return await getCommentById(id);
}
//updateComment("5e94ad2151673db3efd4fe1c","I am updated2");
module.exports = {
    addComments,
    getCommentById,
    getAllComments,
    removeComment,
    updateComment
};
