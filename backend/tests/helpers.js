const jwt = require('jsonwebtoken');
const User = require('../src/models/User.model');
const Pet = require('../src/models/Pet.model');
const Vet = require('../src/models/Vet.model');
const VetVisit = require('../src/models/VetVisit.model');

const bcrypt = require('bcryptjs');

const createTestUser = async () => {
    const hashedPassword = await bcrypt.hash('Password123', 10);
    const user = await User.create({
        email: 'test@test.com',
        password: hashedPassword,
        firstName: 'Test',
        lastName: 'User'
    });

    const token = jwt.sign(
        { _id: user._id, email: user.email, firstName: user.firstName, lastName: user.lastName },
        process.env.TOKEN_SECRET,
        { algorithm: 'HS256', expiresIn: '24h' }
    );

    return { user, token };
};

let petUserCounter = 0;
const createPetTestUser = async () => {
    petUserCounter++;
    const hashedPassword = await bcrypt.hash('Password123', 10);
    const user = await User.create({
        email: `pettest${petUserCounter}@test.com`,
        password: hashedPassword,
        firstName: `PetTest${petUserCounter}`,
        lastName: 'User'
    });

    const token = jwt.sign(
        { _id: user._id, email: user.email, firstName: user.firstName, lastName: user.lastName },
        process.env.TOKEN_SECRET,
        { algorithm: 'HS256', expiresIn: '24h' }
    );

    return { user, token };
};

const createTestPet = async (user, data = {}) => {
    const birthDate = new Date();
    birthDate.setFullYear(birthDate.getFullYear() - 3);

    return await Pet.create({
        name: data.name || 'TestPet',
        species: data.species || 'dog',
        birthDate: data.birthDate || new Date('2020-01-01'),
        weight: data.weight || 25,
        user: user._id
    });
};

const createTestVet = async (user, pet, overrides = {}) => {
    const vet = await Vet.create({
        clinicName: overrides.clinicName || 'Test Clinic',
        vetName: overrides.vetName || 'Dr. Test',
        address: {
            street: '123 Test St',
            city: 'Test City',
            state: 'TS',
            zipCode: '12345',
            country: 'Test Country'
        },
        contactInfo: {
            email: 'test@vet.com',
            phone: '123-456-7890'
        },
        pets: [pet._id],
        ...overrides
    });

    // Add vet to pet's vets array
    await Pet.findByIdAndUpdate(pet._id, {
        $addToSet: { vets: vet._id }
    });

    return vet;
};

const createTestVetVisit = async (pet, vet, overrides = {}) => {
    const visit = await VetVisit.create({
        pet: pet._id,
        vet: vet._id,
        dateOfVisit: overrides.dateOfVisit || new Date(),
        reason: overrides.reason || 'Regular checkup',
        notes: overrides.notes || 'Test notes',
        ...overrides
    });

    // Add visit to pet's vetVisits array
    await Pet.findByIdAndUpdate(pet._id, {
        $push: { vetVisits: visit._id }
    });

    return visit;
};

module.exports = {
    createTestUser,
    createPetTestUser,
    createTestPet,
    createTestVet,
    createTestVetVisit,
};