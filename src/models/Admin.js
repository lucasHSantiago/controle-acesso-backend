const mongoose = require('mongoose');
const bcrypt = require('bcryptjs')

const AdminSchema = new mongoose.Schema({
    email: String,
    password: {
        type: String,
        select: false
    },
});

AdminSchema.pre('save', async function(next) {
    const hash = await bcrypt.hash(this.password, 10);
    this.password = hash;

    next();
});

module.exports = mongoose.model('Admin', AdminSchema);