const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken')

module.exports = {
    async store(req, res) {
        const { email, password } = req.body;

        let admin = await Admin.findOne({ email });

        if (admin) {
            return res.status(409).send({ error: 'Email already exist' });
        }

        admin = await Admin.create({ email, password });
        admin.password = undefined;

        const token =  jwt.sign({ id: admin.id }, authConfig.secret, {
            expiresIn: 86400,
        });

        return res.json({ user, token });
    },

    async index(req, res) {
        let admins = await Admin.find();

        return res.json(admins);
    },
};