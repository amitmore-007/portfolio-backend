// server.js
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
require('dotenv').config();

// Debug environment variables
console.log('Email environment variable exists:', !!process.env.EMAIL);
console.log('Password environment variable exists:', !!process.env.PASSWORD);
// Don't log the actual values for security reasons

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({
  origin: "https://amit-more-portfolio.netlify.app/", // Allow only your frontend
  methods: ["POST"],
  allowedHeaders: ["Content-Type"]
}));


const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // use SSL
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD
    }
  });

// Contact form endpoint
app.post('/api/contact', async (req, res) => {
  const { name, email, subject, message } = req.body;
  
  // Simple validation
  if (!name || !email || !message) {
    return res.status(400).json({ success: false, message: 'Please fill all required fields' });
  }
  
  try {
    // Email options
    const mailOptions = {
      from: process.env.EMAIL,
      to: process.env.RECIPIENT_EMAIL, // where you want to receive messages
      replyTo: email,
      subject: subject ? `Portfolio Contact: ${subject}` : 'New message from portfolio contact form',
      html: `
        <h3>New Contact Form Submission</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        ${subject ? `<p><strong>Subject:</strong> ${subject}</p>` : ''}
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `
    };
    
    // Send email
    await transporter.sendMail(mailOptions);
    
    res.status(200).json({ success: true, message: 'Your message has been sent successfully!' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ success: false, message: 'Failed to send message. Please try again later.' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});