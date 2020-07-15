const mongoose = require('mongoose');

const VisitSchema = new mongoose.Schema({
    day: Number,
    month: Number,
    year: Number,
    hourStart: Number,
    hourEnd: Number,
    custumers: Array,
});

module.exports = mongoose.model('Visit', VisitSchema);