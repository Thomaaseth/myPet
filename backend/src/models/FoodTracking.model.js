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
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Virtual for calculating remaining days
foodTrackingSchema.virtual('remainingDays').get(function() {
  return Math.floor(this.totalWeight / this.dailyAmount);
});

// Virtual for calculating depletion date
foodTrackingSchema.virtual('depletionDate').get(function() {
  const days = this.remainingDays;
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
});

foodTrackingSchema.set('toJSON', { virtuals: true });
foodTrackingSchema.set('toObject', { virtuals: true });

const FoodTracking = mongoose.model('FoodTracking', foodTrackingSchema);

module.exports = FoodTracking;