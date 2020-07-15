const mongoose = require('mongoose');

const MestreSchema = new mongoose.Schema({
    maximoPessoas: Number,
    tempoPermanencia: Number,
    horarioInicialFuncionamento: Number,
    horarioFinalFuncionamento: Number,
});

module.exports = mongoose.model('Mestre', MestreSchema);