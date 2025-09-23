const ApiError = require('../error/ApiError');

const User = require('../models/user');
const BlackList = require('../models/blackListModel');

const Token = require('../models/tokenModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const {
  sendVerificationEmail,
  sendResetPasswordEmail,
} = require('../utils/verifyEmail');
const {
  generateAccessToken,
  generateRefreshToken,
} = require('../utils/tokenFunction');

const generateJwt = (id, email, role) => {
  return jwt.sign({ id, email, role }, process.env.SECRET_KEY, {
    expiresIn: '24h',
  });
};

class AuthControllers {
  async registration(req, res, next) {
    try {
      const { fullName, email, password, login, confirmPassword } = req.body;

      if (!email || !password) {
        return next(ApiError.badRequest('Incorrect email or password'));
      }

      if (password !== confirmPassword) {
        return next(ApiError.badRequest('Passwords do not match'));
      }

      const blacklisted = await BlackList.findOne({ email });
      if (blacklisted) {
        return next(ApiError.forbidden('This email is blacklisted'));
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

      const blacklisted = await BlackList.findOne({ email });
      if (blacklisted) {
        return next(
          ApiError.forbidden('This user is blacklisted and cannot log in')
        );
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

      const accessToken = generateAccessToken(user.id, user.email, user.role);
      const refreshToken = generateRefreshToken(user.id);

      const existingToken = await Token.findOne({ userId: user.id });
      if (existingToken) {
        await Token.update(
          existingToken.id,
          {
            token: refreshToken,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
          { userId: user.id }
        );
      } else {
        await Token.create({
          userId: user.id,
          token: refreshToken,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });
      }

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.json({ accessToken });
    } catch (err) {
      console.error(err);
    }
  }

  async refresh(req, res, next) {
    try {
      const { refreshToken } = req.cookies;
      if (!refreshToken) {
        return next(ApiError.badRequest('Refresh token not provided'));
      }

      let payload;
      try {
        payload = jwt.verify(refreshToken, process.env.REFRESH_SECRET_KEY);
      } catch (err) {
        return next(ApiError.badRequest('Invalid or expired refresh token'));
      }

      const tokenInDb = await Token.findOne({ token: refreshToken });
      if (!tokenInDb) {
        return next(ApiError.badRequest('Refresh token not found'));
      }

      const user = await User.findById(payload.id);
      if (!user) {
        return next(ApiError.badRequest('User not found'));
      }

      await Token.deleteAll({ token: refreshToken });

      const newAccessToken = generateAccessToken(
        user.id,
        user.email,
        user.role
      );
      const newRefreshToken = generateRefreshToken(user.id);

      await Token.create({
        userId: user.id,
        token: newRefreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });

      res.cookie('refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.json({ accessToken: newAccessToken });
    } catch (err) {
      console.error(err);
      return next(ApiError.internal('Something went wrong'));
    }
  }

  async logout(req, res, next) {
    try {
      const { refreshToken } = req.cookies;
      if (refreshToken) {
        await Token.deleteAll({ token: refreshToken });
      }
      res.clearCookie('refreshToken');
      return res.json({ message: 'Logged out successfully' });
    } catch (err) {
      console.error(err);
      return next(ApiError.internal('Logout failed'));
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
