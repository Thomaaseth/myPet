const express = require('express');
const router = express.Router();
const Vet = require('../models/Vet.model');
const VetVisit = require('../models/VetVisit.model');
const Pet = require('../models/Pet.model');
const User = require('../models/User.model')
const mongoose = require('mongoose');
const { isAuthenticated } = require('../middleware/jwt.middleware');
const multer = require('multer');
const upload = multer({ dest: 'uploads/vet-documents/' });

// VET ROUTES

// Get all vets for a specific pet
router.get('/pets/:petId/vets', isAuthenticated, async (req, res) => {
    try {
        const pet = await Pet.findOne({ 
            _id: req.params.petId, 
            user: req.user._id 
        }).populate('vets');

        if (!pet) {
            return res.status(404).json({ message: 'Pet not found' });
        }

        res.status(200).json({
            message: 'Vets retrieved successfully',
            data: pet.vets || []
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching vets', error: error.toString() });
    }
});


// Create new vet for a pet
router.post('/pets/:petId/vets', isAuthenticated, async (req, res) => {
    try {
        const pet = await Pet.findOne({ 
            _id: req.params.petId, 
            user: req.user._id 
        });

        if (!pet) {
            return res.status(404).json({ message: 'Pet not found' });
        }

        // Validate required fields
        const { clinicName, vetName, contactInfo } = req.body;
        if (!clinicName || !vetName || !contactInfo?.phone) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Check if vet already exists for this user
        let existingVet = await Vet.findOne({
            clinicName: clinicName,
            vetName: vetName,
            'pets': { $in: await Pet.find({ user: req.user._id }) }
        });

        if (existingVet) {
            // If vet exists, just add it to this pet if not already added
            if (!pet.vets.includes(existingVet._id)) {
                pet.vets.push(existingVet._id);
                await pet.save();

                if (!existingVet.pets.includes(pet._id)) {
                    existingVet.pets.push(pet._id);
                    await existingVet.save();
                }
            }

            return res.status(200).json({
                message: 'Existing vet added to pet successfully',
                data: existingVet
            });
        }

        // Create new vet if doesn't exist
        const newVet = await Vet.create(req.body);
        
        // Add vet to pet's vets array
        pet.vets.push(newVet._id);
        await pet.save();

        // Add pet to vet's pets array
        newVet.pets.push(pet._id);
        await newVet.save();

        res.status(201).json({
            message: 'Vet created and added to pet successfully',
            data: newVet
        });
    } catch (error) {
        res.status(400).json({ 
            message: 'Error creating/adding vet', 
            error: error.toString() 
        });
    }
});

// Update vet
router.put('/pets/:petId/vets/:vetId', isAuthenticated, async (req, res) => {
    try {
        const pet = await Pet.findOne({ 
            _id: req.params.petId, 
            user: req.user._id,
            vets: req.params.vetId
        });

        if (!pet) {
            return res.status(404).json({ message: 'Pet or vet not found' });
        }

        const updatedVet = await Vet.findByIdAndUpdate(
            req.params.vetId,
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

// Remove vet from pet (not deleting the vet completely)
router.delete('/pets/:petId/vets/:vetId', isAuthenticated, async (req, res) => {
    try {
        const pet = await Pet.findOne({ 
            _id: req.params.petId, 
            user: req.user._id 
        });

        if (!pet) {
            return res.status(404).json({ message: 'Pet not found' });
        }

        // Remove vet from pet's vets array
        pet.vets = pet.vets.filter(v => v.toString() !== req.params.vetId);
        await pet.save();

        // Remove pet from vet's pets array
        await Vet.findByIdAndUpdate(req.params.vetId, {
            $pull: { pets: pet._id }
        });

        // If vet has no more pets, optionally delete the vet
        const vet = await Vet.findById(req.params.vetId);
        if (vet && vet.pets.length === 0) {
            await Vet.findByIdAndDelete(req.params.vetId);
        }

        res.status(200).json({
            message: 'Vet removed from pet successfully'
        });
    } catch (error) {
        res.status(400).json({ message: 'Error removing vet', error: error.toString() });
    }
});

// VISIT ROUTES

// Get all visits for a specific pet and vet
router.get('/pets/:petId/vets/:vetId/visits', isAuthenticated, async (req, res) => {
    try {

        if (!mongoose.Types.ObjectId.isValid(req.params.petId)) {
            return res.status(404).json({ message: 'Invalid pet ID format' });
        }
        if (!mongoose.Types.ObjectId.isValid(req.params.vetId)) {
            return res.status(404).json({ message: 'Invalid vet ID format' });
        }
        // Verify pet belongs to user and has this vet
        const pet = await Pet.findOne({
            _id: req.params.petId,
            user: req.user._id,
            vets: req.params.vetId
        });

        if (!pet) {
            return res.status(404).json({ message: 'Pet or vet not found' });
        }

        const visits = await VetVisit.find({ 
            pet: req.params.petId,
            vet: req.params.vetId 
        })
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
router.post('/pets/:petId/vets/:vetId/visits', isAuthenticated, upload.array('documents'), async (req, res) => {
    try {
        // Verify pet belongs to user and has this vet
        const pet = await Pet.findOne({
            _id: req.params.petId,
            user: req.user._id,
            vets: req.params.vetId
        });

        if (!pet) {
            return res.status(404).json({ message: 'Pet or vet not found' });
        }

        const { dateOfVisit } = req.body;
        if (!dateOfVisit) {
            return res.status(400).json({ message: 'Date of visit is required' });
        }

        // Validate date is not in future
        if (new Date(dateOfVisit) > new Date()) {
            return res.status(400).json({ message: 'Visit date cannot be in the future' });
        }

        // Handle document uploads - ensure documents is always an array
        const documents = Array.isArray(req.files) ? req.files.map(file => ({
            name: file.originalname,
            url: file.path,
            uploadDate: new Date(),
            type: file.mimetype
        })) : [];

        const visitData = {
            pet: req.params.petId,
            vet: req.params.vetId,
            dateOfVisit,
            documents,
            // Optional fields
            nextAppointment: req.body.nextAppointment || undefined,
            reason: req.body.reason || undefined,
            notes: req.body.notes || undefined,
            prescriptions: req.body.prescriptions ? JSON.parse(req.body.prescriptions) : []
        };

        const visit = await VetVisit.create(visitData);

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
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Error adding visit', error: error.toString() });
    }
});

// Update visit
router.put('/pets/:petId/vets/:vetId/visits/:visitId', isAuthenticated, upload.array('documents'), async (req, res) => {
    try {
        const pet = await Pet.findOne({
            _id: req.params.petId,
            user: req.user._id,
            vets: req.params.vetId
        });

        if (!pet) {
            return res.status(404).json({ message: 'Pet or vet not found' });
        }

        const visit = await VetVisit.findOne({
            _id: req.params.visitId,
            pet: req.params.petId,
            vet: req.params.vetId
        });
        
        if (!visit) {
            return res.status(404).json({ message: 'Visit not found' });
        }

        // Handle new documents if any - ensure documents is always an array
        const newDocuments = Array.isArray(req.files) ? req.files.map(file => ({
            name: file.originalname,
            url: file.path,
            uploadDate: new Date(),
            type: file.mimetype
        })) : [];

        // Update fields
        const updates = {
            ...(req.body.dateOfVisit && { dateOfVisit: req.body.dateOfVisit }),
            ...(req.body.nextAppointment && { nextAppointment: req.body.nextAppointment }),
            ...(req.body.reason && { reason: req.body.reason }),
            ...(req.body.notes && { notes: req.body.notes }),
            ...(req.body.prescriptions && { prescriptions: JSON.parse(req.body.prescriptions) }),
        };

        if (newDocuments.length > 0) {
            visit.documents = [...(visit.documents || []), ...newDocuments];
        }

        Object.assign(visit, updates);
        await visit.save();

        res.status(200).json({
            message: 'Visit updated successfully',
            data: visit
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Error updating visit', error: error.toString() });
    }
});

// Delete visit
router.delete('/pets/:petId/vets/:vetId/visits/:visitId', isAuthenticated, async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.petId)) {
            return res.status(404).json({ message: 'Invalid pet ID format' });
        }
        if (!mongoose.Types.ObjectId.isValid(req.params.vetId)) {
            return res.status(404).json({ message: 'Invalid vet ID format' });
        }
        if (!mongoose.Types.ObjectId.isValid(req.params.visitId)) {
            return res.status(404).json({ message: 'Invalid visit ID format' });
        }
        
        // Verify pet belongs to user and has this vet
        const pet = await Pet.findOne({
            _id: req.params.petId,
            user: req.user._id,
            vets: req.params.vetId
        });

        if (!pet) {
            return res.status(404).json({ message: 'Pet or vet not found' });
        }

        const visit = await VetVisit.findOne({
            _id: req.params.visitId,
            pet: req.params.petId,
            vet: req.params.vetId
        });
        
        if (!visit) {
            return res.status(404).json({ message: 'Visit not found' });
        }

        // Remove visit from pet's vetVisits array
        await Pet.findByIdAndUpdate(
            req.params.petId,
            { $pull: { vetVisits: visit._id } }
        );

        await VetVisit.findByIdAndDelete(visit._id);

        res.status(200).json({ 
            message: 'Visit deleted successfully' 
        });
    } catch (error) {
        res.status(400).json({ message: 'Error deleting visit', error: error.toString() });
    }
});
module.exports = router;