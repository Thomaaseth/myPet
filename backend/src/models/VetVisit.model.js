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
                if (this.isUpcoming) {
                    return date > new Date();  // Must be in future for upcoming visits
                }
                return date <= new Date();     // Must be in past for past visits
            },
            message: props => props.value <= new Date() ? 
                'Upcoming visit date must be in the future' : 
                'Past visit date cannot be in the future'
        }
    },
    isUpcoming: {
        type: Boolean,
        required: true,
        default: false
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
    }]
}, { timestamps: true });

const VetVisit = mongoose.model('VetVisit', vetVisitSchema);
module.exports = VetVisit;