const express = require('express');
const { body } = require('express-validator');
const { register, login } = require('../controllers/authController');
const verifyEmail = require('../controllers/authController').verifyEmail;
const authMiddleware = require('../middleware/authMiddleware');
const getUserDetails = require('../controllers/authController').getUserDetails;
const changePassword = require('../controllers/authController').changePassword;
const getNameByLinkId = require('../controllers/authController').getNameByLinkId;


const router = express.Router();

const registerLimiter = require('express-rate-limit')({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // 5 registrations per IP per hour
});

const loginLimiter = require('express-rate-limit')({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // 10 login attempts per IP per hour
});


router.post(
    '/register',
    registerLimiter,
    [
        body('email').isEmail().withMessage('Invalid email'),
        body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    ],
    register
);

router.post(
    '/login',
    loginLimiter,
    [
        body('email').isEmail().withMessage('Invalid email'),
        body('password').exists().withMessage('Password is required'),
    ],
    login
);


router.put(
    '/user/password',
    authMiddleware,
    [
        body('newPassword').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    ],
    changePassword
)

router.get(
    '/verify-email/:token',
    verifyEmail

);

router.get(
    '/user',
    authMiddleware,
    getUserDetails

)

router.get(
    '/user/:link_id',
    getNameByLinkId
)

module.exports = router;