const express = require('express');
const router = express.Router();
const FoodTracking = require('../models/FoodTracking.model');
const Pet = require('../models/Pet.model');
const { isAuthenticated } = require('../middleware/jwt.middleware');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

// Get all pets for the logged-in user
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const pets = await Pet.find({ user: req.user._id });
    res.status(200).json({
      message: `Successfully retrieved ${pets.length} pet(s)`,
      data: pets.map(pet => ({
        ...pet.toJSON(),
        birthDate: pet.birthDate.toISOString().split('T')[0] // Format as YYYY-MM-DD
      }))
    });
  } catch (error) {
    console.error('Error fetching pets:', error);
    res.status(500).json({ message: 'Error fetching pets', error: error.toString() });
  }
});

// Get species list
router.get('/species-list', async (req, res) => {
  try {
    const { PET_SPECIES, ALLOWED_SPECIES } = require('../models/Pet.model');
    res.status(200).json({
      message: 'Species list retrieved successfully',
      data: {
        categories: PET_SPECIES,
        flatList: ALLOWED_SPECIES
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching species list', error: error.toString() });
  }
});

// Get pet weights
router.get('/:id/weights', isAuthenticated, async (req, res) => {
  try {
    const pet = await Pet.findOne({ _id: req.params.id, user: req.user._id });
    
    if (!pet) {
      return res.status(404).json({ message: 'Pet not found' });
    }

    res.status(200).json({
      message: 'Weights retrieved successfully',
      data: pet.weights
    });
  } catch (error) {
    res.status(400).json({ message: 'Error fetching weights', error: error.toString() });
  }
});

// Add weight entry
router.post('/:id/weights', isAuthenticated, async (req, res) => {
  try {
    const { weight, date } = req.body;

    // Validate weight
    if (!weight || isNaN(weight) || weight <= 0) {
      return res.status(400).json({ message: 'Valid weight is required' });
    }

    // Validate date
    const weightDate = new Date(date);
    if (isNaN(weightDate) || weightDate > new Date()) {
      return res.status(400).json({ message: 'Valid date is required and cannot be in the future' });
    }

    const pet = await Pet.findOne({ _id: req.params.id, user: req.user._id });
    
    if (!pet) {
      return res.status(404).json({ message: 'Pet not found' });
    }

    pet.weights.push({ weight: Number(weight), date: weightDate });
    await pet.save();

    res.status(201).json({
      message: 'Weight entry added successfully',
      data: pet.weights[pet.weights.length - 1]
    });
  } catch (error) {
    res.status(400).json({ message: 'Error adding weight entry', error: error.toString() });
  }
});


// Update weight entry
router.put('/:id/weights/:weightId', isAuthenticated, async (req, res) => {
  try {
    const { weight, date } = req.body;
    
    // Validate weight
    if (!weight || isNaN(weight) || weight <= 0) {
      return res.status(400).json({ message: 'Valid weight is required' });
    }

    // Validate date
    const weightDate = new Date(date);
    if (isNaN(weightDate) || weightDate > new Date()) {
      return res.status(400).json({ message: 'Valid date is required and cannot be in the future' });
    }

    const pet = await Pet.findOne({ 
      _id: req.params.id, 
      user: req.user._id 
    });
    
    if (!pet) {
      return res.status(404).json({ message: 'Pet not found' });
    }

    // Find and update the specific weight entry
    const weightEntry = pet.weights.id(req.params.weightId);
    if (!weightEntry) {
      return res.status(404).json({ message: 'Weight entry not found' });
    }

    // Update the weight entry
    weightEntry.weight = Number(weight);
    weightEntry.date = weightDate;

    // Save the updated pet document
    await pet.save();

    res.status(200).json({
      message: 'Weight entry updated successfully',
      data: weightEntry
    });
  } catch (error) {
    res.status(400).json({ 
      message: 'Error updating weight entry', 
      error: error.toString() 
    });
  }
});

// Delete weight entry
router.delete('/:id/weights/:weightId', isAuthenticated, async (req, res) => {
  try {
    if (!req.params.weightId) {
      return res.status(400).json({ message: 'Weight ID is required' });
    }

    const pet = await Pet.findOne({ _id: req.params.id, user: req.user._id });
    
    if (!pet) {
      return res.status(404).json({ message: 'Pet not found' });
    }

    const weightExists = pet.weights.some(w => w._id.toString() === req.params.weightId);
    if (!weightExists) {
      return res.status(404).json({ message: 'Weight entry not found' });
    }

    pet.weights = pet.weights.filter(w => w._id.toString() !== req.params.weightId);
    await pet.save();

    res.status(200).json({ message: 'Weight entry deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Error deleting weight entry', error: error.toString() });
  }
});

router.get('/:id/food-tracking', isAuthenticated, async (req, res) => {
  try {
    const pet = await Pet.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!pet) {
      return res.status(404).json({ message: 'Pet not found' });
    }

    const foodTracking = await FoodTracking.findOne({ pet: req.params.id });
    
    res.status(200).json({
      message: 'Food tracking data retrieved successfully',
      data: foodTracking
    });
  } catch (error) {
    res.status(400).json({ message: 'Error fetching food tracking data', error: error.toString() });
  }
});

// Create or update food tracking data
router.post('/:id/food-tracking', isAuthenticated, async (req, res) => {
  try {
    const pet = await Pet.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!pet) {
      return res.status(404).json({ message: 'Pet not found' });
    }

    const { type, totalWeight, dailyAmount } = req.body;

    const foodTracking = await FoodTracking.findOneAndUpdate(
      { pet: req.params.id },
      {
        type,
        totalWeight,
        dailyAmount,
        lastUpdated: new Date()
      },
      { 
        new: true,
        upsert: true,
        runValidators: true
      }
    );

    res.status(200).json({
      message: 'Food tracking data updated successfully',
      data: foodTracking
    });
  } catch (error) {
    res.status(400).json({ message: 'Error updating food tracking data', error: error.toString() });
  }
});

// Delete food tracking data
router.delete('/:id/food-tracking', isAuthenticated, async (req, res) => {
  try {
    const pet = await Pet.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!pet) {
      return res.status(404).json({ message: 'Pet not found' });
    }

    await FoodTracking.findOneAndDelete({ pet: req.params.id });

    res.status(200).json({
      message: 'Food tracking data deleted successfully'
    });
  } catch (error) {
    res.status(400).json({ message: 'Error deleting food tracking data', error: error.toString() });
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
    const currentDate = new Date();
    const weightEntry = {
      weight: Number(weight),
      date: currentDate
    };
    
    const newPet = new Pet({
      name,
      species,
      birthDate: birthDateObj,
      weight: Number(weight),
      imageUrl,
      user: req.user._id,
      weights: [weightEntry] 
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

    // First check if the pet exists and belongs to the user
    const existingPet = await Pet.findOne({ 
      _id: req.params.id, 
      user: req.user._id 
    });

    if (!existingPet) {
      return res.status(404).json({ message: 'Pet not found' });
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

      // Only add to weights array if weight has changed
      if (existingPet.weight !== Number(weight)) {
        updateData.$push = {
          weights: {
            weight: Number(weight),
            date: new Date()
          }
        };
      }
    }

    if (req.file) {
      updateData.imageUrl = req.file.path;
    }

    const updatedPet = await Pet.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

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