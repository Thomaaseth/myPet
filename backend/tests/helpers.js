const jwt = require('jsonwebtoken');
const User = require('../src/models/User.model');
const Pet = require('../src/models/Pet.model');
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

module.exports = {
    createTestUser,
    createPetTestUser,
    createTestPet
};