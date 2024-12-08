const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
// const { resendService } = require('../services/resend.service');
const { resendService } = require('../services');
const { handleSuccess } = require('../utils/SuccessHandler');
const templateService = require('../utils/viewTemplates');
const fetch = require('node-fetch');
const {Headers} = require('node-fetch');
const linkedInEmail = require('../models/linkedInEmail.model'); // Assume you have a model to track sent emails
const constants = require('../utils/constants');

global.fetch = fetch;
global.Headers = Headers;

const sendEmail = catchAsync(async (req, res) => {
    const {firstName, email} = req.body;
    const adminMail = constants.ADMIN_EMAIL;
    const emailSubjectAdmin = `Contact Form Submission | AntratiQA Website`;
    const userSubject = `Thanks For Contacting AntartiQA | ${firstName}`;
    const {bodyForAdmin, bodyForUser} = await generateEmail(req.body);
    const verifyEmail = await resendService.triggerEmail(email, adminMail, userSubject, emailSubjectAdmin,  bodyForAdmin, bodyForUser);
    handleSuccess(httpStatus.OK, {verifyEmail}, 'Email Sent Successfully.', req, res);
});

const sendLinkedInEmail = catchAsync(async (req, res) => {
    const {userEmail, bodyForUser} = await generateLinkedInEmail(req.body);

    // Check if email was already sent to user
    const existingEmail = await linkedInEmail.findOne({ email: userEmail });
    if (existingEmail) {
        handleSuccess(httpStatus.OK, {userEmail}, 'Email Already Sent.', req, res);
    } else {
        const verifyEmail = await resendService.sendLinkedInEmail(userEmail, bodyForUser);
        handleSuccess(httpStatus.OK, {verifyEmail}, 'Email Sent Successfully.', req, res);
    }
});

const generateEmail = async ({ firstName, lastName, email, phoneNumber, interestedIn, companyName, countryName, subject, message, mailType }) => {
    // const adminMail = 'aashishbhagwat4u@gmail.com';
    console.log(interestedIn);
    const bodyForAdmin = await templateService.fetchAdminTemplate({email, firstName, lastName, phoneNumber, interestedIn, companyName, countryName, subject, message});
    let bodyForUser = '';
    if(mailType === 'career') {
        bodyForUser = await templateService.careerMailToUser({email, firstName, interestedIn, lastName, phoneNumber, subject, message});
    } else if (mailType === 'contact') {
        bodyForUser = await templateService.contactMailToUser({email, firstName, interestedIn, lastName, phoneNumber, subject, message});
    }
    console.log(bodyForAdmin);
    console.log(bodyForUser);
    return { bodyForAdmin, bodyForUser };
};

const generateLinkedInEmail = async ({ email }) => {
    const bodyForUser = await templateService.fetchLinkedInMailToUserTemplate()
    console.log(bodyForUser);
    return { userEmail: email, bodyForUser };
};

module.exports = {
    sendEmail,
    sendLinkedInEmail
};
