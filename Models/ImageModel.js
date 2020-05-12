class ImageModel {
    constructor (DAO) {
        this.DAO = DAO
    }
  
    async createTable() {
        const sql = `
            CREATE TABLE IF NOT EXISTS images (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            uuid TEXT,
            title TEXT,
            image BLOB,
            timestamp DATE
        )`
        return await this.DAO.run(sql)
    }

    async add (uuid, title, image) {
        //Create a new timestamp
        var today = new Date();

        return await this.DAO.run(
            'INSERT INTO images (uuid, title, image, timestamp) VALUES (?, ?, ?, ?)',
            [uuid, title, image, today]
        );
    }

    async getAllWithUUID (uuid) {
        return await this.DAO.all(
            `SELECT id, image, timestamp FROM images WHERE uuid=? ORDER BY timestamp`,
            [uuid]
        );
    }
}
  
module.exports = KeywordsModel;