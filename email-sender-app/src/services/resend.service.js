const {Resend} = require('resend');
const nodemailer = require('nodemailer');
const config = require('../config/config');
const logger = require('../config/logger');
const linkedInEmail = require('../models/linkedInEmail.model'); // Assume you have a model to track sent emails

const transport = nodemailer.createTransport(config.email.smtp);
/* istanbul ignore next */
if (config.env !== 'test') {
    transport
        .verify()
        .then(() => logger.info('Connected to email server'))
        .catch(() => logger.warn('Unable to connect to email server. Make sure you have configured the SMTP options in .env'));
}


const triggerEmail = async (userEmail, adminMail, userSubject, emailSubjectAdmin, bodyForAdmin, bodyForUser) => {
    const resend = new Resend(config.resend_key);
    const result = await resend.batch.send([
        {
            from: 'Creative Hand <contact@creativehand.co.in>',
            to: [userEmail],
            subject: userSubject,
            html: bodyForUser.updatedHtmlContent,
            headers: {
                'X-Entity-Ref-ID': config.resend_headers,
            },
            tags: [
                {
                    name: 'category',
                    value: 'confirm_email',
                },
            ],
        },
        {
            from: 'Creative Hand <contact@creativehand.co.in>',
            to: [adminMail],
            subject: emailSubjectAdmin,
            html: bodyForAdmin.updatedHtmlContent,
            headers: {
                'X-Entity-Ref-ID': config.resend_headers,
            },
            tags: [
                {
                    name: 'category',
                    value: 'confirm_email',
                },
            ],
        }
    ]);

    console.log(result);

    return result;
};

const sendLinkedInEmail = async (userEmail, bodyForUser) => {
    const resend = new Resend(config.resend_key);

    // Sending the email using the Resend API
    const result = await resend.batch.send([
        {
            from: 'Creative Hand <contact@creativehand.co.in>',
            to: [userEmail],
            subject: 'Potential Fit for Your Team – Aashish Bhagwat’s Portfolio',
            html: bodyForUser.updatedHtmlContent,
            headers: {
                'X-Entity-Ref-ID': config.resend_headers,
            },
            tags: [
                {
                    name: 'category',
                    value: 'confirm_email',
                },
            ],
        }
    ]);

    // Check if the email already exists in the database
    const existingEmail = await linkedInEmail.findOne({ email: userEmail });

    // If the email does not exist, save it to the database
    if (!existingEmail) {
        await new linkedInEmail({ email: userEmail }).save();
        console.log(`Saved email: ${userEmail}`);
    }

    // Return the result of the Resend API call
    return result;
};


module.exports = {
    triggerEmail,
    sendLinkedInEmail
};
