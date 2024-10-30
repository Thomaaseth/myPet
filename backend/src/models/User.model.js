const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    email: { 
        type: String, 
        unique: true, 
        required: true 
    },
    password: { 
        type: String, 
        required: true 
    },
    firstName: { 
        type: String, 
        required: true 
    },
    lastName: { 
        type: String, 
        required: true 
    },
    vets: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vet'
    }]
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
module.exports = User;