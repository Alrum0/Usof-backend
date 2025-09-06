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
    expiresIn: '15m',
  });

  const url = `http://localhost:3000/api/auth/verify?token=${token}`;

  await transporter.sendMail({
    from: '"My App" <no-reply@myapp.com>',
    to: user.email,
    subject: 'Confirm your email',
    html: `<a href="${url}">Натисни, щоб підвердити email</a>`,
  });
}

async function sendResetPasswordEmail(user) {
  const resetToken = jwt.sign({ userId: user.id }, process.env.SECRET_KEY, {
    expiresIn: '15m',
  });

  const resetLink = `http://localhost:3000/api/auth/password-reset/${resetToken}`;

  console.log('Reset link:', resetLink);

  await transporter.sendMail({
    from: '"My App" <no-reply@myapp.com>',
    to: user.email,
    subject: 'Reset your password',
    html: `<a href="${resetLink}">Натисни, щоб скинути свій пароль</a>`,
  });
}

module.exports = { sendVerificationEmail, sendResetPasswordEmail };
