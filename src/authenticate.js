const User = require('./models/User');
const Admin = require('./models/Admin');

const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const authConfig = require('./config/auth.json');

function generateToken(params = {}) {
    return jwt.sign(params, authConfig.secret, {
        expiresIn: 86400,
    });
}

module.exports = {
    async authenticate (req, res) {
        const { email, password } = req.body;
    
        const user = await User.findOne({ email }).select('+password');
    
        if (!user)
            return res.status(400).send({ error: 'Usuário não cadastrado'});

        if (!await bcrypt.compare(password, user.password))
            return res.status(400).send({ error: 'Senha inválida'});

        user.password = undefined;

        res.send({ user, token: generateToken({ id: user.id }) });
    },

    async authenticateAdmin (req, res) {
        const { email, password } = req.body;
    
        const admin = await Admin.findOne({ email }).select('+password');
    
        if (!admin)
            return res.status(400).send({ error: 'Admin não encontrado'});

        if (!await bcrypt.compare(password, admin.password))
            return res.status(400).send({ error: 'Senha inválida'});

        admin.password = undefined;

        res.send({ admin, token: generateToken({ id: admin.id, admin: true }) });
    },
};