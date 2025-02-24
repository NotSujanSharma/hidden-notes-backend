const axios = require('axios');
const { getLink } = require('../models/linkModel');

async function getMessagingLink(req, res) {
    try {
        const userId = req.userId;
        const link = await getLink(userId);
        res.json(link);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}

module.exports = { getMessagingLink };