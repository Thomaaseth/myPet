const mongoose = require('mongoose');

const foodTrackingSchema = new mongoose.Schema({
  pet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pet',
    required: true
  },
  type: {
    type: String,
    enum: ['dry', 'moist'],
    required: true
  },
  totalWeight: {
    type: Number,
    required: true,
    validate: {
      validator: function(value) {
        return value > 0;
      },
      message: 'Total weight must be greater than 0'
    }
  },
  dailyAmount: {
    type: Number,
    required: true,
    validate: {
      validator: function(value) {
        return value > 0;
      },
      message: 'Daily amount must be greater than 0'
    }
  },
  dateBought: {
    type: Date,
    required: true,
    validate: {
      validator: function(date) {
        return date <= new Date();
      },
      message: 'Date bought cannot be in the future'
    }
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Virtual for calculating remaining days
foodTrackingSchema.virtual('remainingDays').get(function() {
  const today = new Date();
  const daysUsed = Math.floor((today - this.dateBought) / (1000 * 60 * 60 * 24));
  const totalFoodUsed = daysUsed * this.dailyAmount;
  const remainingFood = this.totalWeight - totalFoodUsed;
  return Math.max(0, Math.floor(remainingFood / this.dailyAmount));
});

// Virtual for calculating depletion date
foodTrackingSchema.virtual('depletionDate').get(function() {
  const daysRemaining = this.remainingDays;
  const date = new Date();
  date.setDate(date.getDate() + daysRemaining);
  return date;
});

foodTrackingSchema.set('toJSON', { virtuals: true });
foodTrackingSchema.set('toObject', { virtuals: true });

const FoodTracking = mongoose.model('FoodTracking', foodTrackingSchema);

module.exports = FoodTracking;