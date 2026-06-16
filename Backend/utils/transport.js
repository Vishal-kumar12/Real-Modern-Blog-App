const nodemailer = require('nodemailer')
const { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS, FRONTEND_URL} = require('../config/dotenv.config')







const transporter = nodemailer.createTransport({
    host: EMAIL_HOST,
  port: EMAIL_PORT,
  secure: true, // Use true for port 465, false for port 587
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
})

module.exports = transporter

