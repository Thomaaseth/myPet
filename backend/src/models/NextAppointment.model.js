const mongoose = require('mongoose');


const nextAppointmentSchema = new mongoose.Schema({
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
    dateScheduled: { 
        type: Date, 
        required: true 
    },
    reason: String,
    notes: String
}, { timestamps: true });

const NextAppointment = mongoose.model('NextAppointment', nextAppointmentSchema);
module.exports = NextAppointment;