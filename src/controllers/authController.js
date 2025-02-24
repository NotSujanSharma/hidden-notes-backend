const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { nanoid } = require('nanoid');
const { validationResult } = require('express-validator');
const { createUser, getUserByEmail, createLink, linkIdExists, verifyUser, getUserByToken } = require('../models/userModel');
const { createToken } = require('../models/tokenModel');
const { sendVerificationEmail } = require('../utils/email');

async function register(req, res) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        const { email, password } = req.body;
        const existingUser = await getUserByEmail(email);
        if (existingUser) return res.status(409).json({ message: 'Email already registered' });

        const passwordHash = await bcrypt.hash(password, 10);
        const userId = await createUser(email, passwordHash);

        let linkId;
        do {
            linkId = nanoid(12);
        } while (await linkIdExists(linkId));
        await createLink(linkId, userId);

        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
        await createToken(userId, token, 'verification', expiresAt);

        const verificationLink = `http://localhost:${process.env.PORT}/api/verify-email/${token}`;
        await sendVerificationEmail(email, verificationLink);

        res.status(201).json({ message: 'Registered successfully. Please verify your email.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}

async function login(req, res) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        const { email, password } = req.body;
        const user = await getUserByEmail(email);
        if (!user || !(await bcrypt.compare(password, user.password_hash))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        if (!user.email_verified) return res.status(403).json({ message: 'Email not verified' });

        const token = jwt.sign({ userId: user.user_id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}

async function verifyEmail(req, res) {
    try {
        const { token } = req.params;
        const user = await getUserByToken(token, 'verification');
        if (!user) return res.status(404).json({ message: 'Token not found' });

        await verifyUser(user.user_id);
        res.json({ message: 'Email verified successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}


module.exports = { register, login, verifyEmail };