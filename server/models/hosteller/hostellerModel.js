const mongoose = require('mongoose');

const hostellerSchema = new mongoose.Schema({
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
    roomNumber:{
        type: number, 
        required: true 
    },
    block:{
        type: number, 
    }, 
    profileImageUrl: String,
});

const Hosteller = mongoose.model('Hosteller', hostellerSchema);
module.exports = Hosteller;
//Wait i am stopping my screen