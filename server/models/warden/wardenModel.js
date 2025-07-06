const mongoose = require('mongoose');

const wardenSchema = new mongoose.Schema({
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
        required: true,
        validate: {
            validator: function (v) {
            return /^\d{10}$/.test(v); // Exactly 10 digits
        },
        message: props => `${props.value} is not a valid 10-digit phone number`
        }
    },
    profileImageUrl: String,
});

const Warden = mongoose.model('Warden', wardenSchema);
module.exports = Warden;
