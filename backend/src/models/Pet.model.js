const mongoose = require('mongoose');

// Species list
const PET_SPECIES = {
    MAMMALS: {
        DOGS: 'dog',
        CATS: 'cat',
        RABBITS: 'rabbit',
        HAMSTERS: 'hamster',
        GUINEA_PIGS: 'guinea pig',
        FERRETS: 'ferret',
        GERBILS: 'gerbil',
        MICE: 'mouse',
        RATS: 'rat',
        CHINCHILLAS: 'chinchilla',
        HEDGEHOGS: 'hedgehog'
    },
    BIRDS: {
        PARAKEETS: 'parakeet',
        COCKATIELS: 'cockatiel',
        PARROTS: 'parrot',
        CANARIES: 'canary',
        FINCHES: 'finch',
        LOVEBIRDS: 'lovebird',
        COCKATOOS: 'cockatoo',
        MACAWS: 'macaw'
    },
    FISH: {
        GOLDFISH: 'goldfish',
        BETTAS: 'betta',
        GUPPIES: 'guppy',
        TETRAS: 'tetra',
        ANGELFISH: 'angelfish',
        MOLLIES: 'molly',
        KOI: 'koi'
    },
    REPTILES: {
        TURTLES: 'turtle',
        TORTOISES: 'tortoise',
        LIZARDS: 'lizard',
        GECKOS: 'gecko',
        BEARDED_DRAGONS: 'bearded dragon',
        CHAMELEONS: 'chameleon',
        SNAKES: 'snake'
    },
    AMPHIBIANS: {
        FROGS: 'frog',
        TOADS: 'toad',
        SALAMANDERS: 'salamander',
        NEWTS: 'newt',
        AXOLOTLS: 'axolotl'
    },
    INVERTEBRATES: {
        HERMIT_CRABS: 'hermit crab',
        TARANTULAS: 'tarantula',
        SCORPIONS: 'scorpion',
        MILLIPEDES: 'millipede',
        STICK_INSECTS: 'stick insect',
        SNAILS: 'snail'
    }
};

// Create a flat array of all species for mongoose enum
const ALLOWED_SPECIES = Object.values(PET_SPECIES)
    .reduce((acc, categorySpecies) => [...acc, ...Object.values(categorySpecies)], []);

// Weight Entry Schema
const weightEntrySchema = new mongoose.Schema({
    weight: {
        type: Number,
        required: true,
        min: 0
    },
    date: {
        type: Date,
        required: true,
        validate: {
            validator: function(date) {
                return date <= new Date();
            },
            message: 'Weight date cannot be in the future'
        }
    }
}, { timestamps: true });


const petSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    species: {
        type: String, 
        required: true,
        trim: true,
        enum: {
            values: ALLOWED_SPECIES,
            message: '{VALUE} is not a supported species'
        },
        lowercase: true
    },
    birthDate: {
        type: Date,
        required: true,
        validate: {
            validator: function(date) {
                return date <= new Date();
            },
            message: 'Birth date cannot be in the future'
        }
    },
    weight: {          // Current weight
        type: Number,
        required: true,
        min: 0
    },
    weights: [weightEntrySchema],  // Weight history array
    imageUrl: {
        type: String,
        default: null
    },
    imageUrl: {
        type: String,
        default: null
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    vets: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vet'
    }],
    vetVisits: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'VetVisit'
    }]
}, {timestamps: true});

petSchema.virtual('age').get(function() {
    if (!this.birthDate) return null;
    const today = new Date();
    const birthDate = this.birthDate;
    let age = today.getFullYear() - birthDate.getFullYear();
    if (today.getMonth() < birthDate.getMonth() || 
        (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
});

petSchema.set('toJSON', { virtuals: true });

const Pet = mongoose.model('Pet', petSchema);
module.exports = Pet;
module.exports.PET_SPECIES = PET_SPECIES;
module.exports.ALLOWED_SPECIES = ALLOWED_SPECIES;