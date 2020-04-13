const mongoCollections = require('../config/mongoCollections');
const moments = mongoCollections.moments;
const users = require('./users');
const comments = require('./comments');
const {ObjectId} = require('mongodb');

async function addMoment(userId,postedDate, content, beliked, comments) {
    if (typeof postedDate !== 'string' || !postedDate) throw 'No date provided or wrong input type';
    if (typeof content !== 'string' || !content) throw 'No content provided or wrong input type';

    if (!Array.isArray(beliked) || !beliked) {
        beliked = [];
    }

    if (!Array.isArray(comments) || !comments) {
        comments = [];
    }

    const momentCollection = await moments();
    const newMoment = {
        postedDate: postedDate,
        content: content,
        beliked: beliked,
        comments: comments
    };

    const newInsertInformation = await momentCollection.insertOne(newMoment);
    const newId = newInsertInformation.insertedId;

    await users.addMomentToUser(userId, newId);

    const obj = await getMomentById(newInsertInformation.insertedId.toString());
    return obj;
}
//addMoment("5e94a6afa462eeb398c9d55c","4/13/2020","what the fuck is that?");

async function getMomentById(id) {

    const objId = ObjectId.createFromHexString(id);

    const momentCollection = await moments();
    const moment = await momentCollection.findOne({_id: objId});

    if (!moment) throw 'Moment not found';
    return moment;
}

async function getAllMoments() {
    const momentCollection = await moments();
    return await momentCollection.find({}).toArray();
}

async function removeMoment(userId, id) {

    const momentCollection = await moments();
    let moment = null;
    try {
        moment = await this.getMomentById(id);
    } catch (e) {
        console.log(e);
        return;
    }
    const objId = ObjectId.createFromHexString(id);

    const deletionInfo = await momentCollection.removeOne({_id: objId});
    if (deletionInfo.deletedCount === 0) {
        throw `Could not delete moment with id of ${id}`;
    }
    await users.removeMomentFromUser(userId, id);
    return true;
}

async function updateMoment(id, updatedMoment) {
    const momentCollection = await moments();

    const updatedMomentData = {};

    if (updatedMoment.postedDate) {
        updatedPostData.postedDate = updatedMoment.postedDate;
    }

    if (updatedMoment.content) {
        updatedPostData.content = updatedMoment.content;
    }

    if (updatedMoment.beliked) {
        updatedPostData.beliked = updatedMoment.beliked;
    }

    if (updatedMoment.comments) {
        updatedPostData.comments = updatedMoment.comments;
    }
    const objId = ObjectId.createFromHexString(id);


    await momentCollection.updateOne({_id: objId}, {$set: updatedMomentData});

    return await getMomentById(id);
}

async function addCommentsToMoments(momentId, commentObj) {
    const objId = ObjectId.createFromHexString(momentId);
    let currentMoment = await this.getMomentById(momentId);
    console.log(currentMoment);

    const momentCollection = await moments();
    const updateInfo = await momentCollection.updateOne(
        {_id: objId},
        {$addToSet: {comments: commentObj}}
    );

    if (!updateInfo.matchedCount && !updateInfo.modifiedCount) throw 'Update failed';

    return await this.getMomentById(momentId);
}

async function removeCommentsFromMoments(momentId, commentId) {
    const objId = ObjectId.createFromHexString(momentId);
    const objId2 = ObjectId.createFromHexString(commentId);
    let currentMoment = await getMomentById(momentId);
    console.log(currentMoment);

    const momentCollection = await moments();
    const updateInfo = await momentCollection.updateOne({_id: objId}, {$pull: {comments: {_id: objId2}}});
    if (!updateInfo.matchedCount && !updateInfo.modifiedCount) throw 'Update failed';

    return await getMomentById(momentId);
}
//removeCommentsFromMoments("5e94a6efd99e56b39fc8c6ed","5e94ad2151673db3efd4fe1c");
module.exports = {
    addMoment,
    getAllMoments,
    getMomentById,
    removeMoment,
    updateMoment,
    addCommentsToMoments,
    removeCommentsFromMoments
};