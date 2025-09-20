const ApiError = require('../error/ApiError');
const BlackList = require('../models/blackListModel');

class BlackListController {
  async addToBlackList(req, res, next) {
    try {
      const { email, message } = req.body;

      if (req.user.role !== 'ADMIN') {
        return next(ApiError.forbidden('Only admins can add to blacklist'));
      }

      if (!email) {
        return next(ApiError.badRequest('Email is required'));
      }

      const exists = await BlackList.findOne({ email });
      if (exists) {
        return next(ApiError.badRequest('Email is already in the blacklist'));
      }

      const record = await BlackList.create({
        email,
        message: message || null,
      });

      return res.json({ message: 'Email added to blacklist', record });
    } catch (err) {
      console.error(err);
      return next(ApiError.internal('Error adding to blacklist'));
    }
  }
  async removeFromBlackList(req, res, next) {
    try {
      const { user_id } = req.params;

      if (req.user.role !== 'ADMIN') {
        return next(
          ApiError.forbidden('Only admins can remove from blacklist')
        );
      }

      const record = await BlackList.findById(user_id);
      if (!record) {
        return next(ApiError.badRequest('Record not found in blacklist'));
      }

      await BlackList.delete(user_id);
      return res.json({ message: 'Email removed from blacklist' });
    } catch (err) {
      console.error(err);
      return next(ApiError.internal('Error removing from blacklist'));
    }
  }
  async getBlackList(req, res, next) {
    try {
      if (req.user.role !== 'ADMIN') {
        return next(ApiError.forbidden('Only admins can view the blacklist'));
      }

      const rows = await BlackList.findAll();
      return res.json(rows);
    } catch (err) {
      console.error(err);
      return next(ApiError.internal('Error retrieving blacklist'));
    }
  }
}

module.exports = new BlackListController();
