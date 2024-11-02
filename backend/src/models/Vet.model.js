const mongoose = require('mongoose');

const vetSchema = new mongoose.Schema({
    clinicName: {
        type: String,
        required: true,
        trim: true
    },
    vetName: {
        type: String,
        required: true,
        trim: true
    },
    address: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: String
    },
    contactInfo: {
        email: {
            type: String,
            match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address.']
        },
        phone: {
            type: String,
            required: true
        }
    },
    pets: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pet'
    }],
    visits: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'VetVisit' 
    }]
}, { timestamps: true });

const Vet = mongoose.model('Vet', vetSchema);
module.exports = Vet; 