const pool = require('../../db');

async function getLink(userId) {
    const result = await pool.query('SELECT * FROM Links WHERE user_id = $1', [userId]);
    return result.rows[0];
}



module.exports = { getLink };