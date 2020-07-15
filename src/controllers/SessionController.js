const User = require('../models/User');

const jwt = require('jsonwebtoken')
const authConfig = require('../config/auth.json')

module.exports = {
    async store(req, res) {
        const { name, email, password, phone, cpf } = req.body;

        let user = await User.findOne({ cpf, email });

        if (user) {
            if (user.cpf == cpf)
                return res.status(409).send({ error: 'CPF already exist' });

            return res.status(409).send({ error: 'Email already exist' });
        }

        if (!user)
            user = await User.create({ name, email, password, cellPhone: phone, cpf });

        user.password = undefined;

        const token =  jwt.sign({ id: user.id }, authConfig.secret, {
            expiresIn: 86400,
        });

        return res.json({ user, token });
    },

    async index(req, res) {
        const users = await User.find();

        return res.json(users);
    },

    async show(req, res) {
        const { user_id } = req.headers;

        const user = await User.findById(user_id);

        return res.json(user);
    }
};