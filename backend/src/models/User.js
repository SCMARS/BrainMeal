const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firebaseId: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    age: {
        type: Number,
        required: true
    },
    gender: {
        type: String,
        required: true,
        enum: ['male', 'female', 'other']
    },
    weight: {
        type: Number,
        required: true
    },
    height: {
        type: Number,
        required: true
    },
    activityLevel: {
        type: String,
        required: true,
        enum: ['sedentary', 'light', 'moderate', 'active', 'very_active']
    },
    dietType: {
        type: String,
        required: true,
        enum: ['balanced', 'keto', 'vegetarian', 'vegan', 'paleo']
    },
    calorieTarget: {
        type: Number,
        required: true
    },
    dietaryPreferences: [{
        type: String
    }],
    allergies: [{
        type: String
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Обновляем updatedAt при каждом сохранении
userSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('User', userSchema); 