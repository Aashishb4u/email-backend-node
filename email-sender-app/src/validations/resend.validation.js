const Joi = require('joi');

const email = {
    body: Joi.object().keys({
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
        jobTitle: Joi.string().required(),
        email: Joi.string().required().email(),
        interestedIn: Joi.string().required(),
        companyName: Joi.string().required(),
        phoneNumber: Joi.string().required(),
        countryName: Joi.string().required(),
        message: Joi.string().required(),
        mailType: Joi.string().required(),
    }),
};

const linkedin_email = {
    body: Joi.object().keys({
        email: Joi.string().required().email(),
    }),
};

module.exports = {
    email,
    linkedin_email
};
