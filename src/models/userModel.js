const pool = require('../../db');

async function createUser(email, passwordHash) {
    const result = await pool.query(
        'INSERT INTO Users (email, password_hash) VALUES ($1, $2) RETURNING user_id',
        [email, passwordHash]
    );
    return result.rows[0].user_id;
}

async function getUserByEmail(email) {
    const result = await pool.query('SELECT * FROM Users WHERE email = $1', [email]);
    return result.rows[0];
}

async function getUserById(userId) {
    const result = await pool.query('SELECT * FROM Users WHERE user_id = $1', [userId]);
    return result.rows[0];
}

async function createLink(linkId, userId) {
    await pool.query('INSERT INTO Links (link_id, user_id) VALUES ($1, $2)', [linkId, userId]);
}

async function linkIdExists(linkId) {
    const result = await pool.query('SELECT 1 FROM Links WHERE link_id = $1', [linkId]);
    return result.rows.length > 0;
}

async function getUserIdByLinkId(linkId) {
    const result = await pool.query('SELECT user_id FROM Links WHERE link_id = $1', [linkId]);
    return result.rows[0]?.user_id;
}

async function verifyUser(userId) {
    await pool.query('UPDATE Users SET email_verified = TRUE WHERE user_id = $1', [userId]);
}

async function getUserByToken(token, type) {
    const result = await pool.query(
        'SELECT user_id FROM Tokens WHERE token = $1 AND type = $2 AND expires_at > NOW()',
        [token, type]
    );
    return result.rows[0];
}

async function updatePassword(userId, passwordHash) {
    await pool.query('UPDATE Users SET password_hash = $1 WHERE user_id = $2', [passwordHash, userId]);
}

module.exports = { createUser, getUserByEmail, createLink, linkIdExists, getUserIdByLinkId, verifyUser, getUserByToken, getUserById, updatePassword };