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
        required: true,
        validate: {
            validator: function(date) {
                return date <= new Date();
            },
            message: 'Visit date cannot be in the future'
        }
    },
    nextAppointment: {
        type: Date
    },
    reason: String,
    notes: String,
    documents: [{
        name: { type: String },
        url: { type: String },
        uploadDate: {
            type: Date,
            default: Date.now
        },
        type: { type: String }
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