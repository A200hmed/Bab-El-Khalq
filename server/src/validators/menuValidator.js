const Joi = require('joi');

const menuItemSchema = Joi.object({
  id: Joi.string().optional(),
  name: Joi.string().required().trim(),
  description: Joi.string().optional().allow(''),
  price: Joi.number().positive().required(),
  category: Joi.string().required().trim(),
  image: Joi.string().optional().allow(''),
  available: Joi.boolean().default(true),
  ingredients: Joi.array().items(Joi.string()).optional().default([]),
  createdAt: Joi.string().isoDate().optional(),
  updatedAt: Joi.string().isoDate().optional(),
});

const validateMenuItem = (data) => {
  return menuItemSchema.validate(data);
};

module.exports = { validateMenuItem };
