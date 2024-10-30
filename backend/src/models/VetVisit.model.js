const mongoose = require('mongoose');

const vetVisitSchema = new mongoose.Schema({
    pet: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pet',
        required: true
    },
    vet: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vet',
        required: true
    },
    dateOfVisit: {
        type: Date,
        required: true
    },
    nextAppointment: {
        type: Date
    },
    reason: {
        type: String,
        required: true
    },
    notes: String,
    documents: [{
        name: String,
        url: String,
        uploadDate: {
            type: Date,
            default: Date.now
        },
        type: String
    }],
    prescriptions: [{
        medication: String,
        dosage: String,
        instructions: String,
        startDate: Date,
        endDate: Date
    }]
}, { timestamps: true });

const VetVisit = mongoose.model('VetVisit', vetVisitSchema);
module.exports = VetVisit;