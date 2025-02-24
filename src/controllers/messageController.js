const axios = require('axios');
const { validationResult } = require('express-validator');
const { createMessage, getMessagesByUser } = require('../models/messageModel');
const { getUserIdByLinkId } = require('../models/userModel');

async function submitMessage(req, res) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        const { content, category, captcha } = req.body;
        const { link_id } = req.params;

        // Verify CAPTCHA
        // const verificationUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET}&response=${captcha}`;
        // const response = await axios.post(verificationUrl);
        // if (!response.data.success) return res.status(400).json({ message: 'Invalid CAPTCHA' });

        const userId = await getUserIdByLinkId(link_id);
        if (!userId) return res.status(404).json({ message: 'Link not found' });

        await createMessage(userId, content, category);
        res.status(201).json({ message: 'Message submitted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}

async function getMessages(req, res) {
    try {
        const userId = req.userId;
        const messages = await getMessagesByUser(userId);
        res.json(messages);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}

module.exports = { submitMessage, getMessages };