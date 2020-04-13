const mongoCollections = require('../config/mongoCollections');
const users = mongoCollections.users;
const {ObjectId} = require('mongodb');

//传进来的hobbies必须是数组
async function addUser(firstName, lastName, email, gender, zipcode, age, password, petstype, hobbies) {

    if (!firstName || !lastName || !email || !gender || !zipcode || !age || !password || !petstype || !hobbies) {
        throw `You must provide all the information to add a user`
    }
    const userCollection = await users();

    let hashed = hashcode(JSON.stringify(password));

    let newUser = {
        firstName: firstName,
        lastName: lastName,
        email: email,
        gender: gender,
        zipcode: zipcode,
        age: age,
        hashedPassword: hashed.toString(),
        usersMoment: [],
        petstype: petstype,
        hobbies: hobbies,
        likes: []
    };

    const newInsertInformation = await userCollection.insertOne(newUser);
    if (newInsertInformation.insertedCount === 0) throw 'Insert failed!';
    console.log(newInsertInformation.insertedId);
    const obj = await getUserById(newInsertInformation.insertedId.toString());
    return obj;
}

function hashcode(str) {
    var hash = 0, i, chr, len;
    if (str.length === 0) return hash;
    for (i = 0, len = str.length; i < len; i++) {
        chr = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
}

//addUser("Jianshuo","Yang","123@qq.com","male","07310",
//    "23","123abc","dog",['make','making','things']);

async function getUserById(id) {
    const objId = ObjectId.createFromHexString(id);
    const userCollection = await users();
    const user = await userCollection.findOne({_id: objId});
    if (!user) throw 'User not found';
    return user;
}

async function getAllUsers() {
    const userCollection = await users();
    const userList = await userCollection.find({}).toArray();
    if (!userList) throw 'No users in system!';
    return userList;
}

async function removeUser(id) {
    const objId = ObjectId.createFromHexString(id);
    const userCollection = await users();
    const deletionInfo = await userCollection.removeOne({_id: objId});
    if (deletionInfo.deletedCount === 0) {
        throw `Could not delete user with id of ${id}`;
    }
    return true;
}

//removeUser("5e94762bfc694ab1f680649c");
async function updateUser(id, updatedUser) {

    const objId = ObjectId.createFromHexString(id);

    const oldOne = await getUserById(id);

    if (updatedUser.firstName != null && updatedUser.firstName.length > 0
        && updatedUser.lastName != null && updatedUser.lastName.length > 0
        && updatedUser.email != null && updatedUser.email.length > 0
        && updatedUser.gender != null && updatedUser.gender.length > 0
        && updatedUser.zipcode != null && updatedUser.zipcode.length > 0
        && updatedUser.age != null && updatedUser.age.length > 0
        && updatedUser.petstype != null && updatedUser.petstype.length > 0
        && updatedUser.hobbies != null && updatedUser.hobbies.length > 0) {

        let userUpdateInfo = {
            firstName: updatedUser.firstName,
            lastName: updatedUser.lastName,
            email: updatedUser.email,
            gender: updatedUser.gender,
            zipcode: updatedUser.zipcode,
            age: updatedUser.age,
            hashedPassword: oldOne.hashedPassword.toString(),
            usersMoment: oldOne.usersMoment,
            petstype: updatedUser.petstype,
            hobbies: updatedUser.hobbies,
            likes: oldOne.likes
        };

        const userCollection = await users();
        const updateInfo = await userCollection.updateOne({_id: objId}, {$set: userUpdateInfo});
        if (!updateInfo.matchedCount && !updateInfo.modifiedCount) throw 'Update failed';

        return await getUserById(id);
    } else {
        throw `You must provide all information to update a user profile`
    }
}
/*
const obj = {
    firstName: "s",
    lastName: "s",
    email: "sd2@.com",
    gender: "female",
    zipcode: "ssd111",
    age: "25",
    petstype: "cat",
    hobbies: ["2","2"]
};
updateUser("5e94a6afa462eeb398c9d55c", obj);
密码 usersMoment likes 这三个不能update
*/

async function addMomentToUser(userId, momentId) {
    const objId = ObjectId.createFromHexString(userId);
    let currentUser = await getUserById(userId);
    console.log(currentUser);

    const userCollection = await users();
    const updateInfo = await userCollection.updateOne(
        {_id: objId},
        {$addToSet: {usersMoment: {_id: momentId}}}
    );

    if (!updateInfo.matchedCount && !updateInfo.modifiedCount) throw 'Update failed';

    return await getUserById(userId);
}

async function removeMomentFromUser(userId, momentId) {
    const objId = ObjectId.createFromHexString(userId);
    const objId2 = ObjectId.createFromHexString(momentId);
    let currentUser = await getUserById(userId);
    console.log(currentUser);

    const userCollection = await users();
    const updateInfo = await userCollection.updateOne({_id: objId}, {$pull: {usersMoment: {_id: objId2}}});
    if (!updateInfo.matchedCount && !updateInfo.modifiedCount) throw 'Update failed';

    return await getUserById(userId);
}

//removeMomentFromUser("5e94a6afa462eeb398c9d55c","5e94a6efd99e56b39fc8c6ed");

async function addLikeToUser(userId, likeId) {
    const objId = ObjectId.createFromHexString(userId);

    let currentUser = await this.getUserById(userId);
    console.log(currentUser);

    const userCollection = await users();
    const updateInfo = await userCollection.updateOne(
        {_id: objId},
        {$addToSet: {likes: {id: likeId}}}
    );

    if (!updateInfo.matchedCount && !updateInfo.modifiedCount) throw 'Update failed';

    return await this.getUserById(objId);
}

async function removeLikeFromUser(userId, likeId) {
    const objId = ObjectId.createFromHexString(userId);
    const objId2 = ObjectId.createFromHexString(likeId);

    let currentUser = await this.getUserById(userId);
    console.log(currentUser);

    const userCollection = await users();
    const updateInfo = await userCollection.updateOne({_id: objId}, {$pull: {likes: {id: objId2}}});
    if (!updateInfo.matchedCount && !updateInfo.modifiedCount) throw 'Update failed';

    return await this.getUserById(userId);
}

module.exports = {
    addUser,
    getUserById,
    getAllUsers,
    removeUser,
    updateUser,
    addMomentToUser,
    removeMomentFromUser,
    addLikeToUser,
    removeLikeFromUser
};