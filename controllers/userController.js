const ApiError = require('../error/ApiError');

class UserControllers {
  async getUser(req, res, next) {}
  async getAllUsers(req, res, next) {}
  async createUser(req, res, next) {}
  async uploadAvatar(req, res, next) {}
  async updateUser(req, res, next) {}
  async deleteUser(req, res, next) {}
}

module.exports = new UserControllers();
