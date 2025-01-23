const mongoose = require('mongoose');

// Predefined schedules for initial series
const INITIAL_SERIES_SCHEDULES = {
    DOG: {
        'DHPP': [
            { dose: 1, weekDue: 6, notes: 'First DHPP shot' },
            { dose: 2, weekDue: 10, notes: 'Second DHPP shot' },
            { dose: 3, weekDue: 14, notes: 'Third DHPP shot' },
            { dose: 4, weekDue: 16, notes: 'Final DHPP shot' }
        ],
        'Rabies': [
            { dose: 1, weekDue: 12, notes: 'Initial rabies vaccine' }
        ],
        'Bordetella': [
            { dose: 1, weekDue: 8, notes: 'First Bordetella' },
            { dose: 2, weekDue: 12, notes: 'Second Bordetella' }
        ]
    },
    CAT: {
        'FVRCP': [
            { dose: 1, weekDue: 6, notes: 'First FVRCP shot' },
            { dose: 2, weekDue: 10, notes: 'Second FVRCP shot' },
            { dose: 3, weekDue: 14, notes: 'Third FVRCP shot' }
        ],
        'Rabies': [
            { dose: 1, weekDue: 12, notes: 'Initial rabies vaccine' }
        ]
    }
};

// Regular vaccine intervals (in days)
const REGULAR_INTERVALS = {
    DOG: {
        'DHPP': { interval: 365 * 3, isCore: true },
        'Rabies': { interval: 365 * 3, isCore: true },
        'Bordetella': { interval: 365, isCore: false },
        'Leptospirosis': { interval: 365, isCore: false },
        'Lyme': { interval: 365, isCore: false },
        'Influenza': { interval: 365, isCore: false }
    },
    CAT: {
        'FVRCP': { interval: 365 * 3, isCore: true },
        'Rabies': { interval: 365 * 3, isCore: true },
        'FeLV': { interval: 365, isCore: false }
    }
};

// Schema for a single vaccine dose in initial series
const initialSeriesDoseSchema = new mongoose.Schema({
    vaccine: {
        type: String,
        required: true
    },
    doseNumber: {
        type: Number,
        required: true
    },
    dateDue: {
        type: Date,
        required: true
    },
    dateAdministered: Date,
    vet: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vet'
    },
    notes: String,
    completed: {
        type: Boolean,
        default: false
    }
});

// Schema for regular vaccine records
const regularVaccineRecordSchema = new mongoose.Schema({
    vaccine: {
        type: String,
        required: true
    },
    dateAdministered: {
        type: Date,
        required: true
    },
    nextDueDate: {
        type: Date,
        required: true
    },
    vet: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vet'
    },
    batchNumber: String,
    notes: String
});

// Main vaccine tracking schema
const vaccineTrackingSchema = new mongoose.Schema({
    pet: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pet',
        required: true
    },
    trackingType: {
        type: String,
        enum: ['INITIAL_SERIES', 'REGULAR'],
        required: true
    },
    // For initial series tracking
    initialSeries: {
        startDate: Date,
        doses: [initialSeriesDoseSchema],
        completed: {
            type: Boolean,
            default: false
        }
    },
    // For regular tracking
    vaccineHistory: [regularVaccineRecordSchema]
}, { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtuals for status checking
vaccineTrackingSchema.virtual('status').get(function() {
    if (this.trackingType === 'INITIAL_SERIES') {
        if (this.initialSeries.completed) {
            return 'COMPLETED';
        }
        const incompleteDoses = this.initialSeries.doses.filter(dose => !dose.completed);
        if (incompleteDoses.length === 0) {
            return 'COMPLETED';
        }
        const nextDue = incompleteDoses.sort((a, b) => a.dateDue - b.dateDue)[0];
        if (nextDue.dateDue < new Date()) {
            return 'OVERDUE';
        }
        return 'IN_PROGRESS';
    } else {
        // Regular tracking status logic
        const today = new Date();
        const upcomingVaccines = this.vaccineHistory.filter(record => 
            record.nextDueDate > today
        );
        if (upcomingVaccines.length === 0) {
            return 'UP_TO_DATE';
        }
        const nextDue = upcomingVaccines.sort((a, b) => a.nextDueDate - b.nextDueDate)[0];
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(today.getDate() + 30);
        
        if (nextDue.nextDueDate < today) {
            return 'OVERDUE';
        }
        if (nextDue.nextDueDate <= thirtyDaysFromNow) {
            return 'DUE_SOON';
        }
        return 'UP_TO_DATE';
    }
});

// Helper method to initialize initial series
vaccineTrackingSchema.statics.initializeInitialSeries = function(species, startDate) {
    const schedule = INITIAL_SERIES_SCHEDULES[species];
    const doses = [];

    for (const [vaccine, scheduleInfo] of Object.entries(schedule)) {
        scheduleInfo.forEach(({ dose, weekDue, notes }) => {
            const dateDue = new Date(startDate);
            dateDue.setDate(dateDue.getDate() + (weekDue * 7));
            
            doses.push({
                vaccine,
                doseNumber: dose,
                dateDue,
                notes,
                completed: false
            });
        });
    }

    return doses.sort((a, b) => a.dateDue - b.dateDue);
};

// Helper method to get upcoming vaccines for regular tracking
vaccineTrackingSchema.methods.getUpcomingVaccines = function() {
    const today = new Date();
    return this.vaccineHistory
        .filter(record => record.nextDueDate >= today)
        .sort((a, b) => a.nextDueDate - b.nextDueDate);
};

const VaccineTracking = mongoose.model('VaccineTracking', vaccineTrackingSchema);

module.exports = {
    VaccineTracking,
    INITIAL_SERIES_SCHEDULES,
    REGULAR_INTERVALS
};