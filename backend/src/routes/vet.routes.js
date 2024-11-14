const express = require('express');
const router = express.Router();
const Vet = require('../models/Vet.model');
const PastVisit = require('../models/PastVisit.model');
const NextAppointment = require('../models/NextAppointment.model')
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
        // Get all pets for the current user
        const userPets = await Pet.find({ user: req.user._id });
        const userPetIds = userPets.map(p => p._id);

        // Get the current pet with populated vets
        const pet = await Pet.findOne({ 
            _id: req.params.petId, 
            user: req.user._id 
        }).populate({
            path: 'vets'
        });

        if (!pet) {
            return res.status(404).json({ message: 'Pet not found' });
        }

        // For each vet, get their associated pets that belong to the user
        const associatedVets = await Promise.all(pet.vets.map(async (vet) => {
            const vetWithPets = await Vet.findById(vet._id).populate({
                path: 'pets',
                match: { _id: { $in: userPetIds } },
                select: 'name'
            });
            return vetWithPets;
        }));

        res.status(200).json({
            message: 'Vets retrieved successfully',
            data: associatedVets || []
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Error fetching vets', 
            error: error.toString() 
        });
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

        // Get all visits for this pet and vet
        const visits = await PastVisit.find({
            pet: req.params.petId,
            vet: req.params.vetId
        });

        // Remove these visits from both pet and vet
        if (visits.length > 0) {
            const visitIds = visits.map(visit => visit._id);

            // Remove visits from pet's vetVisits array
            await Pet.findByIdAndUpdate(req.params.petId, {
                $pull: { vetVisits: { $in: visitIds } }
            });

            // Remove visits from vet's visits array
            await Vet.findByIdAndUpdate(req.params.vetId, {
                $pull: { visits: { $in: visitIds } }
            });

            // Delete the visits themselves
            await PastVisit.deleteMany({
                _id: { $in: visitIds }
            });
        }

         // Delete next appointment if exists
         const nextAppointment = await NextAppointment.findOne({
            pet: req.params.petId,
            vet: req.params.vetId
        });

        if (nextAppointment) {
            // Remove appointment reference from pet
            await Pet.findByIdAndUpdate(req.params.petId, {
                $unset: { nextAppointment: "" }
            });

            // Remove appointment reference from vet
            await Vet.findByIdAndUpdate(req.params.vetId, {
                $pull: { appointments: nextAppointment._id }
            });

            // Delete the appointment itself
            await NextAppointment.findByIdAndDelete(nextAppointment._id);
        }


        // If vet has no more pets, optionally delete the vet
        const vet = await Vet.findById(req.params.vetId);
        if (vet && vet.pets.length === 0) {
            await PastVisit.deleteMany({ vet: req.params.vetId });
            await NextAppointment.deleteMany({ vet: req.params.vetId });
            await Vet.findByIdAndDelete(req.params.vetId);
        }

        res.status(200).json({
            message: 'Vet removed from pet successfully'
        });
    } catch (error) {
        res.status(400).json({ message: 'Error removing vet', error: error.toString() });
    }
});

router.post('/pets/:petId/vets/:vetId/unlink', isAuthenticated, async (req, res) => {
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
  
      res.status(200).json({
        message: 'Vet unlinked successfully'
      });
    } catch (error) {
      res.status(400).json({ message: 'Error unlinking vet', error: error.toString() });
    }
  });

// VISITS ROUTES

// Past Visits Routes
router.get('/pets/:petId/vets/:vetId/past-visits', isAuthenticated, async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.petId)) {
            return res.status(404).json({ message: 'Invalid pet ID format' });
        }
        if (!mongoose.Types.ObjectId.isValid(req.params.vetId)) {
            return res.status(404).json({ message: 'Invalid vet ID format' });
        }

        const pet = await Pet.findOne({
            _id: req.params.petId,
            user: req.user._id,
            vets: req.params.vetId
        });

        if (!pet) {
            return res.status(404).json({ message: 'Pet or vet not found' });
        }

        const visits = await PastVisit.find({ 
            pet: req.params.petId,
            vet: req.params.vetId 
        })
        .populate('vet')
        .sort({ dateOfVisit: -1 });

        res.status(200).json({
            message: 'Past visits retrieved successfully',
            data: visits
        });
    } catch (error) {
        res.status(400).json({ message: 'Error fetching past visits', error: error.toString() });
    }
});

router.post('/pets/:petId/vets/:vetId/past-visits', isAuthenticated, upload.array('documents'), async (req, res) => {
    try {
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

        // Handle document uploads
        const documents = Array.isArray(req.files) ? 
            req.files.map(file => ({
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
            reason: req.body.reason || undefined,
            notes: req.body.notes || undefined,
        };

        const visit = await PastVisit.create(visitData);

        // Add visit references
        await Promise.all([
            Pet.findByIdAndUpdate(req.params.petId, { $push: { pastVisits: visit._id } }),
            Vet.findByIdAndUpdate(req.params.vetId, { $push: { pastVisits: visit._id } })
        ]);

        res.status(201).json({
            message: 'Past visit added successfully',
            data: visit
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Error adding past visit', error: error.toString() });
    }
});

// Update visit
router.put('/pets/:petId/vets/:vetId/past-visits/:visitId', isAuthenticated, upload.array('documents'), async (req, res) => {
    try {
        const pet = await Pet.findOne({
            _id: req.params.petId,
            user: req.user._id,
            vets: req.params.vetId
        });

        if (!pet) {
            return res.status(404).json({ message: 'Pet or vet not found' });
        }

        const visit = await PastVisit.findOne({
            _id: req.params.visitId,
            pet: req.params.petId,
            vet: req.params.vetId
        });
        
        if (!visit) {
            return res.status(404).json({ message: 'Visit not found' });
        }

        // Handle new documents
        const newDocuments = Array.isArray(req.files) ? req.files.map(file => ({
            name: file.originalname,
            url: file.path,
            uploadDate: new Date(),
            type: file.mimetype
        })) : [];

        // Update fields
        const updates = {
            dateOfVisit: req.body.dateOfVisit,
            reason: req.body.reason,
            notes: req.body.notes
        };

        if (newDocuments.length > 0) {
            visit.documents = [...(visit.documents || []), ...newDocuments];
        }

        Object.assign(visit, updates);
        await visit.save();

        res.status(200).json({
            message: 'Past visit updated successfully',
            data: visit
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Error updating past visit', error: error.toString() });
    }
});

// Delete visit
router.delete('/pets/:petId/vets/:vetId/past-visits/:visitId', isAuthenticated, async (req, res) => {
    try {
        const pet = await Pet.findOne({
            _id: req.params.petId,
            user: req.user._id,
            vets: req.params.vetId
        });

        if (!pet) {
            return res.status(404).json({ message: 'Pet or vet not found' });
        }

        const visit = await PastVisit.findOne({
            _id: req.params.visitId,
            pet: req.params.petId,
            vet: req.params.vetId
        });
        
        if (!visit) {
            return res.status(404).json({ message: 'Visit not found' });
        }

        // Remove references
        await Promise.all([
            Pet.findByIdAndUpdate(req.params.petId, 
                { $pull: { pastVisits: visit._id } }
            ),
            Vet.findByIdAndUpdate(req.params.vetId, 
                { $pull: { pastVisits: visit._id } }
            )
        ]);

        await PastVisit.findByIdAndDelete(visit._id);

        res.status(200).json({ 
            message: 'Past visit deleted successfully' 
        });
    } catch (error) {
        res.status(400).json({ message: 'Error deleting past visit', error: error.toString() });
    }
})

// Next Appointment Routes
router.get('/pets/:petId/vets/:vetId/next-appointment', isAuthenticated, async (req, res) => {
    try {
        const pet = await Pet.findOne({
            _id: req.params.petId,
            user: req.user._id,
            vets: req.params.vetId
        });

        if (!pet) {
            return res.status(404).json({ message: 'Pet or vet not found' });
        }

        const appointment = await NextAppointment.findOne({ 
            pet: req.params.petId,
            vet: req.params.vetId 
        }).populate('vet');

        res.status(200).json({
            message: 'Next appointment retrieved successfully',
            data: appointment
        });
    } catch (error) {
        res.status(400).json({ message: 'Error fetching next appointment', error: error.toString() });
    }
});

router.post('/pets/:petId/vets/:vetId/next-appointment', isAuthenticated, async (req, res) => {
    try {
        const pet = await Pet.findOne({
            _id: req.params.petId,
            user: req.user._id,
            vets: req.params.vetId
        });

        if (!pet) {
            return res.status(404).json({ message: 'Pet or vet not found' });
        }

        // Check if an appointment already exists
        const existingAppointment = await NextAppointment.findOne({
            pet: req.params.petId,
            vet: req.params.vetId
        });

        if (existingAppointment) {
            return res.status(400).json({ message: 'A next appointment already exists' });
        }

        const appointmentData = {
            pet: req.params.petId,
            vet: req.params.vetId,
            dateScheduled: req.body.dateScheduled,
            reason: req.body.reason,
            notes: req.body.notes
        };

        const appointment = await NextAppointment.create(appointmentData);

        // Add appointment references
        await Promise.all([
            Pet.findByIdAndUpdate(req.params.petId, { nextAppointment: appointment._id }),
            Vet.findByIdAndUpdate(req.params.vetId, { $push: { appointments: appointment._id } })
        ]);

        res.status(201).json({
            message: 'Next appointment scheduled successfully',
            data: appointment
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Error scheduling appointment', error: error.toString() });
    }
});

router.put('/pets/:petId/vets/:vetId/next-appointment/:appointmentId', isAuthenticated, async (req, res) => {
    try {
        const pet = await Pet.findOne({
            _id: req.params.petId,
            user: req.user._id,
            vets: req.params.vetId
        });

        if (!pet) {
            return res.status(404).json({ message: 'Pet or vet not found' });
        }

        const appointment = await NextAppointment.findOne({
            _id: req.params.appointmentId,
            pet: req.params.petId,
            vet: req.params.vetId
        });

        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        // Update fields
        const updates = {
            dateScheduled: req.body.dateScheduled,
            reason: req.body.reason,
            notes: req.body.notes
        };

        Object.assign(appointment, updates);
        await appointment.save();

        res.status(200).json({
            message: 'Next appointment updated successfully',
            data: appointment
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Error updating next appointment', error: error.toString() });
    }
});

router.delete('/pets/:petId/vets/:vetId/next-appointment/:appointmentId', isAuthenticated, async (req, res) => {
    try {
        const pet = await Pet.findOne({
            _id: req.params.petId,
            user: req.user._id,
            vets: req.params.vetId
        });

        if (!pet) {
            return res.status(404).json({ message: 'Pet or vet not found' });
        }

        const appointment = await NextAppointment.findOne({
            _id: req.params.appointmentId,
            pet: req.params.petId,
            vet: req.params.vetId
        });

        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        // Remove references
        await Promise.all([
            Pet.findByIdAndUpdate(req.params.petId, 
                { $unset: { nextAppointment: "" } }
            ),
            Vet.findByIdAndUpdate(req.params.vetId, 
                { $pull: { appointments: appointment._id } }
            )
        ]);

        await NextAppointment.findByIdAndDelete(appointment._id);

        res.status(200).json({ 
            message: 'Next appointment cancelled successfully' 
        });
    } catch (error) {
        res.status(400).json({ message: 'Error cancelling appointment', error: error.toString() });
    }
});

module.exports = router;