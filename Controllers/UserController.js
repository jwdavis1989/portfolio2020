const UserModel = require('../Models/UserModel');

class UserController 
{
    constructor (dao) 
    {
        this.UserModel = new UserModel(dao);
    }
    async getUserID(username)
    {
        var uuid = await this.UserModel.getUserID(username);
        console.log(uuid);
        return uuid;
    }

}

module.exports = UserController;

/*exports.getUserID = async function (username) {
    return await UserModel.getUserID(username);
}

exports.deleteUser = async (userID) => {
    console.log(`delete user: ${userID}`);
}

exports.updateUsername = async (userID, username) => {
    console.log(`update ${userID} name to ${username}`);
}*/