const Joi = require('joi');


const signupValidation = (req, res, next) => {
  const schema = Joi.object({
    firstName: Joi.string().min(2).max(50).required().label('First Name'),
    lastName: Joi.string().min(2).max(50).required().label('Last Name'),
    email: Joi.string().email().required().label('Email'),
    password: Joi.string().min(6).required().label('Password'),
    confirmPassword: Joi.string()
      .required()
      .valid(Joi.ref('password'))
      .label('Confirm Password')
      .messages({ 'any.only': '{{#label}} does not match Password' })
  });

  const { error } = schema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });
  next();
};


const loginValidation = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email().required().label('Email'),
    password: Joi.string().min(6).required().label('Password'),
  });

  const { error } = schema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });
  next();
};


module.exports = {
  signupValidation,
  loginValidation
};
