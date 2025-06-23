const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
    title: { 
        type: String, 
        required: true 
    },
    description: { 
        type: String, 
        required: true 
    },
    category: {
        type: String,
        enum: ['Plumbing', 'Electricity', 'Cleaning', 'Furniture', 'WiFi', 'Other'],
        required: true
    },
    roomno:{
        type:number,
        required:true
    },
    block:{
        type:String,
        required:true
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

const Complaint = mongoose.model('Complaint', complaintSchema);
module.exports = Complaint;
