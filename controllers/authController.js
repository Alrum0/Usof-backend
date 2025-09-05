const ApiError = require('../error/ApiError');
const User = require('../models/user');
const Token = require('../models/tokenModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const generateJwt = (id, email, role) => {
  return jwt.sign({ id, email, role }, process.env.SECRET_KEY, {
    expiresIn: '24h',
  });
};

class AuthControllers {
  async registration(req, res, next) {
    try {
      const { fullName, email, password, role } = req.body;
      if (!email || !password) {
        return next(ApiError.badRequest('Incorrect email or password'));
      }

      const candidate = await User.findOne({ email });
      if (candidate) {
        return next(ApiError.badRequest('User with this email already exists'));
      }

      const hashPassword = await bcrypt.hash(password, 5);
      const user = await User.create({
        fullName,
        email,
        password: hashPassword,
      });
      const token = generateJwt(user.id, user.email, user.role);

      await Token.create({
        userId: user.id,
        token,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });

      return res.json({ token });
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
  async logout(req, res, next) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      if (token) await Token.deleteAll({ token });
      return res.json({ message: 'Logged out successfully' });
    } catch (err) {
      console.error(err);
    }
  }

  async passwordReset(req, res, next) {}
  async confirmToken(req, res, next) {}
}

module.exports = new AuthControllers();
