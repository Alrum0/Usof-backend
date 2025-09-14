const ApiError = require('../error/ApiError');
const BaseModel = require('./baseModel');

class User extends BaseModel {
  constructor() {
    super('users');
  }

  async updateStarsBalance(userId, delta) {
    const user = await this.findById(userId);
    if (!user) {
      throw ApiError.badRequest('User not found');
    }

    const newBalance = user.stars_balance + delta;
    if (newBalance < 0) {
      throw ApiError.badRequest('Not enough stars');
    }

    return this.update(userId, { stars_balance: newBalance });
  }
}

module.exports = new User();
