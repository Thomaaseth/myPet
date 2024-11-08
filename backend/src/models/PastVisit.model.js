const mongoose = require('mongoose');

const pastVisitSchema = new mongoose.Schema({
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
}, { timestamps: true });

const PastVisit = mongoose.model('PastVisit', pastVisitSchema);
module.exports = PastVisit;