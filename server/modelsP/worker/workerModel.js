const mongoose = require('mongoose');

const workerSchema = new mongoose.Schema({
    role: {
        type: String,
        required: true
    },
    firstName: { 
        type: String, 
        required: true 
    },
    lastName: String,
    email: { 
        type: String, 
        required: true, 
        unique: true 
    },
    password: { 
        type: String, 
        required: true 
    },
    phone: {
        type: String,
        required:true
    },
    profileImageUrl: String,
});

const Worker = mongoose.model('Worker', workerSchema);
module.exports = Worker;
