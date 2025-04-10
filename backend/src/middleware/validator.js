const Joi = require('joi');

const mealPlanSchema = Joi.object({
    userData: Joi.object({
        age: Joi.number().integer().min(1).max(120).required(),
        gender: Joi.string().valid('male', 'female', 'other').required(),
        weight: Joi.number().min(20).max(300).required(),
        height: Joi.number().min(100).max(250).required(),
        dietType: Joi.string().required(),
        calorieTarget: Joi.number().min(1000).max(5000).required(),
        activityLevel: Joi.string().required(),
        dietaryPreferences: Joi.array().items(Joi.string()),
        allergies: Joi.array().items(Joi.string())
    }).required(),
    existingMeals: Joi.array().items(Joi.object())
});

const validateMealPlan = (req, res, next) => {
    const { error } = mealPlanSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ 
            error: 'Validation Error',
            details: error.details.map(detail => detail.message)
        });
    }
    next();
};

module.exports = {
    validateMealPlan
}; 