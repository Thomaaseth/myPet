const express = require('express');
const router = express.Router();
const Vet = require('../models/Vet.model');
const VetVisit = require('../models/VetVisit.model');
const Pet = require('../models/Pet.model');
const User = require('../models/User.model')
const { isAuthenticated } = require('../middleware/jwt.middleware');
const multer = require('multer');
const upload = multer({ dest: 'uploads/vet-documents/' });

// VET ROUTES

// Get all vets for the logged-in user
router.get('/', isAuthenticated, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate('vets');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({
            message: 'Vets retrieved successfully',
            data: user.vets || []
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching vets', error: error.toString() });
    }
});

// Create new vet
router.post('/', isAuthenticated, async (req, res) => {
    try {
        // Validate required fields
        const { clinicName, vetName, contactInfo } = req.body;
        if (!clinicName || !vetName || !contactInfo?.phone) {
            return res.status(400).json({ 
                message: 'Missing required fields' 
            });
        }

        const newVet = await Vet.create(req.body);
        
        // Add vet to user's vets array
        await User.findByIdAndUpdate(
            req.user._id,
            { $addToSet: { vets: newVet._id } }
        );

        res.status(201).json({
            message: 'Vet created successfully',
            data: newVet
        });
    } catch (error) {
        res.status(400).json({ 
            message: 'Error creating vet', 
            error: error.toString() 
        });
    }
});


// Update vet
router.put('/:id', isAuthenticated, async (req, res) => {
    try {
        // Check if vet belongs to user first
        const user = await User.findById(req.user._id);
        if (!user.vets.includes(req.params.id)) {
            return res.status(404).json({ message: 'Vet not found' });
        }

        const updatedVet = await Vet.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        
        if (!updatedVet) {
            return res.status(404).json({ message: 'Vet not found' });
        }

        res.status(200).json({
            message: 'Vet updated successfully',
            data: updatedVet
        });
    } catch (error) {
        res.status(400).json({ message: 'Error updating vet', error: error.toString() });
    }
});


// Delete vet
router.delete('/:id', isAuthenticated, async (req, res) => {
    try {
        // Check if vet belongs to user first
        const user = await User.findById(req.user._id);
        if (!user.vets.includes(req.params.id)) {
            return res.status(404).json({ message: 'Vet not found' });
        }

        const deletedVet = await Vet.findByIdAndDelete(req.params.id);
        
        if (!deletedVet) {
            return res.status(404).json({ message: 'Vet not found' });
        }

        // Remove vet from user's vets array
        await User.findByIdAndUpdate(
            req.user._id,
            { $pull: { vets: req.params.id } }
        );

        // Remove vet from all associated pets
        await Pet.updateMany(
            { vets: req.params.id },
            { $pull: { vets: req.params.id } }
        );

        res.status(200).json({
            message: 'Vet deleted successfully',
            data: deletedVet
        });
    } catch (error) {
        res.status(400).json({ message: 'Error deleting vet', error: error.toString() });
    }
});

// VISIT ROUTES

// Get all visits for a specific pet
router.get('/:petId/visits', isAuthenticated, async (req, res) => {
    try {
        const visits = await VetVisit.find({ pet: req.params.petId })
            .populate('vet')
            .sort({ dateOfVisit: -1 });

        res.status(200).json({
            message: 'Visits retrieved successfully',
            data: visits
        });
    } catch (error) {
        res.status(400).json({ message: 'Error fetching visits', error: error.toString() });
    }
});

// Add new visit
router.post('/:vetId/visits/:petId', isAuthenticated, upload.array('documents'), async (req, res) => {
    try {
        const { dateOfVisit, nextAppointment, reason, notes, prescriptions } = req.body;
        
        // Handle document uploads
        const documents = req.files?.map(file => ({
            name: file.originalname,
            url: file.path,
            uploadDate: new Date(),
            type: file.mimetype
        })) || [];

        const visit = await VetVisit.create({
            pet: req.params.petId,
            vet: req.params.vetId,
            dateOfVisit,
            nextAppointment,
            reason,
            notes,
            documents,
            prescriptions: JSON.parse(prescriptions || '[]')
        });

        // Add visit to pet's vetVisits array
        await Pet.findByIdAndUpdate(
            req.params.petId,
            { $push: { vetVisits: visit._id } }
        );

        res.status(201).json({
            message: 'Visit added successfully',
            data: visit
        });
    } catch (error) {
        res.status(400).json({ message: 'Error adding visit', error: error.toString() });
    }
});

// Update visit
router.put('/visits/:visitId', isAuthenticated, upload.array('documents'), async (req, res) => {
    try {
        const { dateOfVisit, nextAppointment, reason, notes, prescriptions } = req.body;
        
        // Handle new documents if any
        const newDocuments = req.files?.map(file => ({
            name: file.originalname,
            url: file.path,
            uploadDate: new Date(),
            type: file.mimetype
        })) || [];

        const visit = await VetVisit.findById(req.params.visitId);
        
        if (!visit) {
            return res.status(404).json({ message: 'Visit not found' });
        }

        // Update fields
        visit.dateOfVisit = dateOfVisit || visit.dateOfVisit;
        visit.nextAppointment = nextAppointment || visit.nextAppointment;
        visit.reason = reason || visit.reason;
        visit.notes = notes || visit.notes;
        if (prescriptions) {
            visit.prescriptions = JSON.parse(prescriptions);
        }
        if (newDocuments.length > 0) {
            visit.documents = [...visit.documents, ...newDocuments];
        }

        await visit.save();

        res.status(200).json({
            message: 'Visit updated successfully',
            data: visit
        });
    } catch (error) {
        res.status(400).json({ message: 'Error updating visit', error: error.toString() });
    }
});

// Delete visit
router.delete('/visits/:visitId', isAuthenticated, async (req, res) => {
    try {
        const visit = await VetVisit.findById(req.params.visitId);
        
        if (!visit) {
            return res.status(404).json({ message: 'Visit not found' });
        }

        // Remove visit from pet's vetVisits array
        await Pet.findByIdAndUpdate(
            visit.pet,
            { $pull: { vetVisits: visit._id } }
        );

        await visit.remove();

        res.status(200).json({ 
            message: 'Visit deleted successfully' 
        });
    } catch (error) {
        res.status(400).json({ message: 'Error deleting visit', error: error.toString() });
    }
});

module.exports = router;