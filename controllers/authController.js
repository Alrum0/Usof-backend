const ApiError = require('../error/ApiError');
const User = require('../models/user');
const Token = require('../models/tokenModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const {
  sendVerificationEmail,
  sendResetPasswordEmail,
} = require('../utils/verifyEmail');

const generateJwt = (id, email, role) => {
  return jwt.sign({ id, email, role }, process.env.SECRET_KEY, {
    expiresIn: '24h',
  });
};

class AuthControllers {
  async registration(req, res, next) {
    try {
      const { fullName, email, password, role, login, confirmPassword } =
        req.body;
      if (!email || !password) {
        return next(ApiError.badRequest('Incorrect email or password'));
      }

      if (password !== confirmPassword) {
        return next(ApiError.badRequest('Passwords do not match'));
      }

      const candidateEmail = await User.findOne({ email });
      if (candidateEmail) {
        return next(ApiError.badRequest('User with this email already exists'));
      }

      const candidateLogin = await User.findOne({ login });
      if (candidateLogin) {
        return next(ApiError.badRequest('User with this login already exists'));
      }

      const hashPassword = await bcrypt.hash(password, 5);
      const user = await User.create({
        fullName,
        email,
        login,
        password: hashPassword,
        isVeriffied: false,
      });
      // const token = generateJwt(user.id, user.email, user.role);

      await sendVerificationEmail(user);

      return res.json({
        message: 'Please check your email to confirm account',
      });
    } catch (err) {
      console.error(err);
    }
  }
  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });
      if (!user) {
        return next(ApiError.internal('User with this email not found'));
      }

      if (!user.isVeriffied) {
        return next(
          ApiError.forbidden('Please verify your email before logging in')
        );
      }

      let comparePassword = bcrypt.compareSync(password, user.password);
      if (!comparePassword) {
        return next(ApiError.internal('Incorrect password'));
      }

      const jwtToken = generateJwt(user.id, user.email, user.role);

      await Token.create({
        userId: user.id,
        token: jwtToken,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });

      return res.json({ jwtToken });
    } catch (err) {
      console.error(err);
    }
  }
  //FIXME: ПОдумати над реалізацією logout
  async logout(req, res, next) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      if (token) await Token.deleteAll({ token });
      return res.json({ message: 'Logged out successfully' });
    } catch (err) {
      console.error(err);
    }
  }

  async passwordReset(req, res, next) {
    try {
      const { email } = req.body;

      const user = await User.findOne({ email });
      if (!user) {
        return next(ApiError.badRequest('User with this email not found'));
      }

      await sendResetPasswordEmail(user);
      return res.json({
        message: 'Please check your email to reset your password',
      });
    } catch (err) {
      console.error(err);
    }
  }
  async confirmToken(req, res, next) {
    try {
      const { confirm_token } = req.params;
      const { newPassword } = req.body;

      if (!newPassword) {
        return next(ApiError.badRequest('New password is required'));
      }

      let playload;
      try {
        playload = jwt.verify(confirm_token, process.env.SECRET_KEY);
      } catch (err) {
        return next(ApiError.badRequest('Invalid or expired token'));
      }

      const user = await User.findById(playload.userId);
      if (!user) {
        return next(ApiError.internal('User not found'));
      }

      // const tokenRecord = await Token.findOne({ token: confirm_token });
      // if (!tokenRecord) {
      //   return next(ApiError.badRequest('Token is invalid or already used'));
      // }

      const hashPassword = await bcrypt.hash(newPassword, 5);

      const isSame = await bcrypt.compare(newPassword, user.password);
      if (isSame) {
        return next(
          ApiError.badRequest(
            'New password cannot be the same as the old password'
          )
        );
      }

      await User.update(user.id, { password: hashPassword });

      // await Token.deleteAll({ token: confirmToken });

      return res.json({ message: 'Password has been reset successfully' });
    } catch (err) {
      console.error(err);
      return next(ApiError.internal('Something went wrong'));
    }
  }

  async verifyEmail(req, res, next) {
    try {
      const { token } = req.query;
      const playload = jwt.verify(token, process.env.SECRET_KEY);

      const user = await User.findById(playload.userId);
      if (!user) {
        return next(ApiError.badRequest('Invalid token'));
      }

      if (user.isVeriffied) {
        return res.json({ message: 'Email already verified' });
      }

      await User.update(user.id, { isVeriffied: true });

      return res.json({ message: 'Email verified successfully' });
    } catch (err) {
      next(ApiError.badRequest('Invalid token or expired token'));
      console.error(err);
    }
  }
}

module.exports = new AuthControllers();
