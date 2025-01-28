const express = require('express');
const router = express.Router();

const { VaccineTracking, INITIAL_SERIES_SCHEDULES, REGULAR_INTERVALS } = require('../models/Vaccine.model');
const Pet = require('../models/Pet.model');
const { isAuthenticated } = require('../middleware/jwt.middleware')


// Initialize vaccine tracking for a pet
router.post('/pets/:petId/vaccines/setup', isAuthenticated, async (req, res) => {
    try {
        const { trackingType, startDate } = req.body;

        // Verify pet exists and belong to user
        const pet = await Pet.findOne({ _id: req.params.petId, user: req.user._id});
        if (!pet) {
            return res.status(404).json({ message: 'Pet not found'});
        }

        // Check if tracking already exists
        const existingTracking = await VaccineTracking.findOne({ pet: pet._id});
        if (existingTracking) {
            return res.status(400).json({ message: 'Vaccine tracking already exists for this pet'});
        }
        
        let trackingData = {
            pet: pet._id,
            trackingType
        };

        // Initialize based on tracking type
        if (trackingType === 'INITIAL_SERIES') {
            const doses = VaccineTracking.initializeInitialSeries(
                pet.species,
                startDate || new Date()
            );
            trackingData.initialSeries = {
                startDate: startDate || new Date(),
                doses,
                completed: false
            };
        }

        const vaccineTracking = await VaccineTracking.create(trackingData);
        res.status(201).json({
            message: 'Vaccine tracking initialized',
            data: vaccineTracking
        });
    } catch (error) {
        console.error('Error initializing vaccine tracking:', error);
        res.status(500).json({ message: 'Error initializing vaccine tracking' });
    }
});

// Record a vaccine for initial series
router.post('/pets/:petId/vaccines/initial-series', isAuthenticated, async (req, res) => {
    try {
        const { vaccine, doseNumber, dateAdministered, vet, notes} = req.body;
        const pet = await Pet.findOne({ _id: req.params.petId, user: req.user._id });

        const vaccineTracking = await VaccineTracking.findOne({
            pet: req.params.petId,
            trackingType: 'INITIAL_SERIES'
        });

        if(!vaccineTracking) {
            return res.status(404).json({ message: 'Initial series tracking not found'});
        }

        if (!dateAdministered || new Date(dateAdministered) > new Date()) {
            return res.status(400).json({ message: 'Valid date in the past is required' });
        }

        if (!INITIAL_SERIES_SCHEDULES[pet.species][vaccine]) {
            return res.status(400).json({ message: `Invalid vaccine for ${pet.species}` });
        }

        // Find specific dose
        const doseIndex = vaccineTracking.initialSeries.doses.findIndex(
            dose => dose.vaccine === vaccine && dose.doseNumber === doseNumber
        );

        if(doseIndex === -1) {
            return res.status(404).json({ message: 'Specified dose not found'});
        }

        // Update the dose
        vaccineTracking.initialSeries.doses[doseIndex].dateAdministered = dateAdministered;
        vaccineTracking.initialSeries.doses[doseIndex].vet = vet;
        vaccineTracking.initialSeries.doses[doseIndex].notes = notes;
        vaccineTracking.initialSeries.doses[doseIndex].completed = true;

        // Check if doses are completed
        const allComplete = vaccineTracking.initialSeries.doses.every(dose => dose.completed);
        if (allComplete) {
            vaccineTracking.initialSeries.completed = true;
        }

        await vaccineTracking.save();
        res.status(200).json({
            message: 'Vaccination recorded',
            data: vaccineTracking
        });
    } catch (error) {
        console.error('Error recording vaccination:', error);
        res.status(500).json({ message: 'Error recording vaccination'});
    }
});

// Record a regular vaccination
router.post('/pets/:petId/vaccines/regular', isAuthenticated, async (req, res) => {
    try {
        const { vaccine, dateAdministered, vet, batchNumber, notes } = req.body;

        const pet = await Pet.findOne({ _id: req.params.petId, user: req.user._id });
        if (!pet) {
            return res.status(404).json({ message: 'Pet not found' });
        }

        if (!dateAdministered || new Date(dateAdministered) > new Date()) {
            return res.status(400).json({ message: 'Valid date in the past is required' });
        }

        if (!REGULAR_INTERVALS[pet.species][vaccine]) {
            return res.status(400).json({ message: `Invalid vaccine for ${pet.species}` });
        }

        let vaccineTracking = await VaccineTracking.findOne({
            pet: pet._id,
            trackingType: 'REGULAR'
        });

        // Create new tracking if doesn't exist
        if (!vaccineTracking) {
            vaccineTracking = new VaccineTracking({
                pet: pet._id,
                trackingType: 'REGULAR',
                vaccineHistory: []
            });
        }

        // Calculate next due date
        const interval = REGULAR_INTERVALS[pet.species][vaccine].interval;
        const nextDueDate = new Date(dateAdministered);
        nextDueDate.setDate(nextDueDate.getDate() + interval);

        // Add new vaccination record
        vaccineTracking.vaccineHistory.push({
            vaccine,
            dateAdministered,
            nextDueDate,
            vet,
            batchNumber,
            notes
        });

        await vaccineTracking.save();
        res.status(200).json({
            message: 'Vaccination recorded',
            data: vaccineTracking
        });
    } catch (error) {
        console.error('Error recording vaccination:', error);
        res.status(500).json({ message: 'Error recording vaccination' });
    }
});

// Get vaccine tracking status and history
router.get('/pets/:petId/vaccines', isAuthenticated, async (req, res) => {
    try {
        const vaccineTracking = await VaccineTracking.findOne({ pet: req.params.petId })
            .populate('pet')
            .populate('initialSeries.doses.vet', 'clinicName vetName')
            .populate('vaccineHistory.vet', 'clinicName vetName');

        if (!vaccineTracking) {
            return res.status(404).json({ message: 'No vaccine tracking found for this pet' });
        }

        const response = {
            trackingType: vaccineTracking.trackingType,
            status: vaccineTracking.status
        };

        if (vaccineTracking.trackingType === 'INITIAL_SERIES') {
            response.initialSeries = vaccineTracking.initialSeries;
            response.nextDue = vaccineTracking.initialSeries.doses
                .filter(dose => !dose.completed)
                .sort((a, b) => a.dateDue - b.dateDue)[0];
        } else {
            response.vaccineHistory = vaccineTracking.vaccineHistory;
            response.upcomingVaccines = vaccineTracking.getUpcomingVaccines();
        }

        res.status(200).json({
            message: 'Vaccine tracking retrieved',
            data: response
        });
    } catch (error) {
        console.error('Error fetching vaccine tracking:', error);
        res.status(500).json({ message: 'Error fetching vaccine tracking' });
    }
});

// Transition from initial series to regular tracking
router.post('/pets/:petId/vaccines/transition', isAuthenticated, async (req, res) => {
    try {
        const vaccineTracking = await VaccineTracking.findOne({
            pet: req.params.petId,
            trackingType: 'INITIAL_SERIES'
        });

        if (!vaccineTracking) {
            return res.status(404).json({ message: 'Initial series tracking not found' });
        }

        if (!vaccineTracking.initialSeries.completed) {
            return res.status(400).json({ message: 'Initial series must be completed before transitioning' });
        }

        // Create new regular tracking record
        const regularTracking = await VaccineTracking.create({
            pet: req.params.petId,
            trackingType: 'REGULAR',
            vaccineHistory: []
        });

        // Optionally, archive or mark the initial series record
        vaccineTracking.status = 'ARCHIVED';
        await vaccineTracking.save();

        res.status(200).json({
            message: 'Successfully transitioned to regular tracking',
            data: regularTracking
        });
    } catch (error) {
        console.error('Error transitioning tracking:', error);
        res.status(500).json({ message: 'Error transitioning tracking' });
    }
});

module.exports = router;