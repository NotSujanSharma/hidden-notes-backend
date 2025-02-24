const pool = require('../../db');

async function createMessage(recipientId, content, category) {
    await pool.query(
        'INSERT INTO Messages (recipient_id, content, category) VALUES ($1, $2, $3)',
        [recipientId, content, category]
    );
}

async function getMessagesByUser(userId) {
    const result = await pool.query(
        'SELECT * FROM Messages WHERE recipient_id = $1 ORDER BY created_at DESC',
        [userId]
    );
    return result.rows;
}

module.exports = { createMessage, getMessagesByUser };