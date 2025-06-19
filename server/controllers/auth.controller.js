const { User } = require('../models');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

async function signup(req, res) {
    try {
        const { username, email, password } = req.body;

        // Basic validation
        if (!username || !email || !password) {
            return res.status(400).send({ message: 'Username, email, and password are required!' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            return res.status(400).send({ message: 'Failed! Username or email is already in use!' });
        }

        const hashedPassword = bcrypt.hashSync(password, 8);

        await User.create({
            username,
            email,
            password: hashedPassword,
            role: 'user',
        });

        res.status(201).send({ message: 'User was registered successfully!' });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
}

async function signin(req, res) {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(404).send({ message: 'User Not found.' });
        }

        const passwordIsValid = bcrypt.compareSync(password, user.password);

        if (!passwordIsValid) {
            return res.status(401).send({
                accessToken: null,
                message: 'Invalid Password!',
            });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: 86400, // 24 hours
        });

        res.status(200).send({
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            accessToken: token,
        });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
}

module.exports = { signup, signin };
