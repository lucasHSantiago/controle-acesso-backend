const Mestre = require('../models/Mestre');

module.exports = {
    async index(req, res) {
        if (!req.Admin)
            return res.status(403).send({ error: 'Access denied' });

        const mestre = await Mestre.findOne();

        return res.json(mestre);
    },

    async update(req, res) {
        if (!req.Admin)
            return res.status(403).send({ error: 'Access denied' });

        let mestre = await Mestre.findOne();
        const { maximoPessoas, tempoPermanencia, horarioInicialFuncionamento, horarioFinalFuncionamento } = req.body

        mestre.maximoPessoas               = maximoPessoas;
        mestre.tempoPermanencia            = tempoPermanencia;
        mestre.horarioInicialFuncionamento = horarioInicialFuncionamento;
        mestre.horarioFinalFuncionamento   = horarioFinalFuncionamento;

        try {
            await mestre.save();
        } catch (e) {
            return res.json(e);
        }

        return res.json(mestre);
    }
};