const mongoose = require('mongoose');

const wardenSchema = new mongoose.Schema({
    role: {
        type: String,
        required: true,
        default: 'warden'
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
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
        required: false, // Made optional to match frontend
        validate: {
            validator: function (v) {
                return !v || /^[\+]?[\d\s\-\(\)]{10,15}$/.test(v); // More flexible phone validation
            },
            message: props => `${props.value} is not a valid phone number`
        }
    },
    // Professional Information
    employeeId: {
        type: String,
        required: true,
        unique: true
    },
    department: {
        type: String,
        required: true,
        enum: [
            'Student Affairs',
            'Administration', 
            'Security',
            'Maintenance',
            'IT Services',
            'Food Services',
            'Academic Affairs'
        ]
    },
    hostelBlock: {
        type: String,
        required: true,
        enum: [
            'Block A',
            'Block B', 
            'Block C',
            'Block D',
            'Block E',
            'Block F',
            'Block G',
            'Block H'
        ]
    },
    experience: {
        type: String,
        required: false
    },
    profileImageUrl: {
        type: String,
        required: false
    }
}, {
    timestamps: true // Automatically add createdAt and updatedAt
});

const Warden = mongoose.model('Warden', wardenSchema);
module.exports = Warden;