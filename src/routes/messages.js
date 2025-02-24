const express = require('express');
const { body } = require('express-validator');
const { submitMessage, getMessages } = require('../controllers/messageController');
const { getMessagingLink } = require('../controllers/linkController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.post(
    '/messages/:link_id',
    [
        body('content').notEmpty().withMessage('Message content is required'),
        body('category').isIn(['Feedback', 'Question', 'Compliment']).withMessage('Invalid category'),
        body('captcha').exists().withMessage('CAPTCHA is required'),
    ],
    submitMessage
);

router.get('/messages', authMiddleware, getMessages);

router.get('/get-link', authMiddleware, getMessagingLink);

module.exports = router;