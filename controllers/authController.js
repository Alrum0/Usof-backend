const ApiError = require('../error/ApiError');

class AuthControllers {
  async registration(req, res, next) {}
  async login(req, res, next) {}
  async logout(req, res, next) {}
  async passwordReset(req, res, next) {}
  async confirmToken(req, res, next) {}
}

module.exports = new AuthControllers();
