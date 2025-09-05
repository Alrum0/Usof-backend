require('dotenv').config();

const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendVerificationEmail(user) {
  const token = jwt.sign({ userId: user.id }, process.env.SECRET_KEY, {
    expiresIn: '1d',
  });

  const url = `http://localhost:3000/api/auth/verify?token=${token}`;

  await transporter.sendMail({
    from: '"My App" <no-reply@myapp.com>',
    to: user.email,
    subject: 'Confirm your email',
    html: `<a href="${url}">Натисни, щоб підвердити email</a>`,
  });
}
