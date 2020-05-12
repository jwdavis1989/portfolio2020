class KeywordsModel {
    constructor (DAO) {
        this.DAO = DAO
    }
  
    async createTable() {
        const sql = `
            CREATE TABLE IF NOT EXISTS keywords (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            text TEXT,
            type TEXT
        )`
        return await this.DAO.run(sql)
    }

    async add (text, type) {
        return await this.DAO.run(
            'INSERT INTO keywords (text, type) VALUES (?, ?)',
            [text, type]
        );
    }
    
    async getAll () {
        return await this.DAO.all(
            'SELECT text, type FROM keywords'
        );
    }

    async getAllWithType (type) {
        return await this.DAO.all(
            `SELECT text, type FROM keywords WHERE type=?`,
            [type]
        );
    }

    //Pull a random word from the database of a specific grammatical type.
    async getRandomWithType (type) {
        return await this.DAO.all(
            `SELECT text, type FROM keywords WHERE type=? ORDER BY RANDOM() LIMIT 1`,
            [type]
        );
    }
}
  
module.exports = KeywordsModel;