const express = require('express');
const router = express.Router();
const Pet = require('../models/Pet.model');
const { isAuthenticated } = require('../middleware/jwt.middleware');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

// Get all pets for the logged-in user
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const pet = await Pet.find({ user: req.user._id });
    res.status(200).json({
      message: `Successfully retrieved ${pets.length} pet(s)`,
      data: pets.map(pet => ({
        ...pet.toJSON(),
        birthDate: pet.birthDate.toISOString().split('T')[0] // Format as YYYY-MM-DD
      }))
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching pets', error: error.toString() });
  }
});

// Get a single pet
router.get('/:id', isAuthenticated, async (req, res) => {
    try {
        const pet = await Pet.findOne({_id: req.params.id, user: req.user._id});
        if (!pet) {
            return res.status(404).json({ message: 'Pet not found'});
        }
        res.status(200).json({
            message: 'Pet retrieved successfully',
            data: {
                ...pet.toJSON(),
                birthDate: pet.birthDate.toISOString().split('T')[0]
            }
        });
    } catch (error) {
        res.status(400).json({ message: 'Error fetching pet', error: error.toString() });
    }

});

// Get species list
router.get('/species', async (req, res) => {
  try {
    res.status(200).json({
      message: 'Species list retrieved successfully',
      data: {
        categories: PET_SPECIES,
        flatList: ALLOWED_SPECIES
      }
    });
  } catch {
    res.status(500).json({ message: 'Error fetching species list', error: error.toString() });
  }
})

// Create a new pet
router.post('/', isAuthenticated, upload.single('image'), async (req, res) => {
  try {
    const { name, species, birthDate, weight } = req.body;
    const imageUrl = req.file ? req.file.path : null;

    // Validate required fields
    if (!name || !species || !birthDate || !weight) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Validate birth date
    const birthDateObj = new Date(birthDate);
    if (isNaN(birthDateObj) || birthDateObj > new Date()) {
      return res.status(400).json({ message: 'Invalid birth date or birth date is in the future' });
    }

    // Validate weight
    if (isNaN(weight) || weight <= 0) {
      return res.status(400).json({ message: 'Weight must be a positive number' });
    }

    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const newPet = new Pet({
      name,
      species,
      birthDate: birthDateObj,
      weight: Number(weight),
      imageUrl,
      user: req.user._id
    });

    await newPet.save();
    res.status(201).json({
      message: 'Pet created successfully',
      data: {
        ...newPet.toJSON(),
        birthDate: newPet.birthDate.toISOString().split('T')[0]
      }
    });
  } catch (error) {
    res.status(400).json({ message: 'Error creating pet', error: error.toString() });
  }
});

// Update a pet
router.put('/:id', isAuthenticated, upload.single('image'), async (req, res) => {
  try {
    if (!req.params.id) {
      return res.status(400).json({ message: 'Pet ID is required' });
    }

    const { name, species, birthDate, weight } = req.body;
    const updateData = {};

    if (name) updateData.name = name;
    if (species) updateData.species = species;
    if (birthDate) {
      const birthDateObj = new Date(birthDate);
      if (isNaN(birthDateObj) || birthDateObj > new Date()) {
        return res.status(400).json({ message: 'Invalid birth date or birth date is in the future' });
      }
      updateData.birthDate = birthDateObj;
    }
    if (weight) {
      if (isNaN(weight) || weight <= 0) {
        return res.status(400).json({ message: 'Weight must be a positive number' });
      }
      updateData.weight = Number(weight);
    }


    if (req.file) {
      updateData.imageUrl = req.file.path;
    }

    const updatedPet = await Pet.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      updateData,
      { new: true }
    );

    if (!updatedPet) {
      return res.status(404).json({ message: 'Pet not found' });
    }

    res.status(200).json({
      message: 'Pet updated successfully',
      data: {
        ...updatedPet.toJSON(),
        birthDate: updatedPet.birthDate.toISOString().split('T')[0]
      }
    });
  } catch (error) {
    res.status(400).json({ message: 'Error updating pet', error: error.toString() });
  }
});

// Delete a pet
router.delete('/:id', isAuthenticated, async (req, res) => {
  try {
    const deletedPet = await Pet.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!deletedPet) {
      return res.status(404).json({ message: 'Pet not found' });
    }
    res.status(200).json({
      message: 'Pet deleted successfully',
      data: deletedPet
    });
  } catch (error) {
    res.status(400).json({ message: 'Error deleting pet', error: error.toString() });
  }
});

module.exports = router;