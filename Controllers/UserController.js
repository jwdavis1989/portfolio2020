const UserModel = require('../Models/UserModel');

class UserController 
{
    constructor (dao) 
    {
        this.UserModel = new UserModel(dao);
        console.log(`UserController Constructed Successfully.`)
    }
    async getUserID(username)
    {
        var uuid = await this.UserModel.getUserID(username);
        console.log(`User Controller - UUID: ${uuid.uuid}`);
        return uuid;
    }

}

module.exports = UserController;
