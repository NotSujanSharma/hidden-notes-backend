const pool = require('../../db');

async function createToken(userId, token, type, expiresAt) {
    await pool.query(
        'INSERT INTO Tokens (user_id, token, type, expires_at) VALUES ($1, $2, $3, $4)',
        [userId, token, type, expiresAt]
    );
}

module.exports = { createToken };