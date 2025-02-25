const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { nanoid } = require('nanoid');
const { validationResult } = require('express-validator');
const { createUser, getUserByEmail, createLink, linkIdExists, verifyUser, getUserByToken, getUserById, updatePassword } = require('../models/userModel');
const { createToken } = require('../models/tokenModel');
const { sendVerificationEmail } = require('../utils/email');
const { get } = require('http');

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
            linkId = nanoid(6);
        } while (await linkIdExists(linkId));
        await createLink(linkId, userId);

        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
        await createToken(userId, token, 'verification', expiresAt);

        const verificationLink = `http://localhost:${process.env.PORT}/api/verify-email/${token}`;
        await sendVerificationEmail(email, verificationLink);
        console.log(verificationLink);

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

        const token = jwt.sign({ userId: user.user_id }, process.env.JWT_SECRET, { expiresIn: '1020h' });
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

async function getUserDetails(req, res) {
    try {
        const userId = req.userId;
        const user = await getUserById(userId);
        res.json({ name: "nibba", email: user.email, emailVerified: user.email_verified });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}

async function changePassword(req, res) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        const userId = req.userId;
        const user = await getUserById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const { newPassword, currentPassword } = req.body;
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Both old and new passwords are required' });
        }

        const currentPasswordCorrect = await bcrypt.compare(currentPassword, user.password_hash);
        if (!currentPasswordCorrect) {
            return res.status(400).json({ message: 'Invalid password' });
        }

        const passwordHash = await bcrypt.hash(newPassword, 10);
        await updatePassword(userId, passwordHash);

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}


module.exports = { register, login, verifyEmail, getUserDetails, changePassword };