const ApiError = require('../error/ApiError');
const bcrypt = require('bcrypt');
const User = require('../models/user');
const uuid = require('uuid');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

class UserControllers {
  async getUser(req, res, next) {
    try {
      const { user_id } = req.params;

      const user = await User.findById(user_id);
      if (!user) {
        return next(ApiError.badRequest('User not found'));
      }
      //TODO: подумати над тим, що робити з куристами, які не верифіковані
      if (!user.isVeriffied) {
        const publicData = {
          id: user.id,
          fullName: user.fullName,
          isVeriffied: user.isVeriffied,
          rating: user.rating,
        };
        return res.json(publicData);
      }

      return res.json(user);
    } catch (err) {
      console.error(err);
    }
  }
  async getAllUsers(req, res, next) {
    try {
      const users = await User.findAll();
      return res.json(users);
    } catch (err) {
      console.error(err);
    }
  }
  async createUser(req, res, next) {
    try {
      const { login, fullName, email, password, confirmPassword, role } =
        req.body;
      if (!login || !fullName || !email || !password || !confirmPassword) {
        return next(ApiError.badRequest('All fields are required'));
      }

      if (password !== confirmPassword) {
        return next(ApiError.badRequest('Passwords do not match'));
      }

      if (role !== 'USER' && role !== 'ADMIN') {
        return next(ApiError.badRequest('Invalid role (USER or ADMIN)'));
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
      await User.create({
        login,
        fullName,
        email,
        password: hashPassword,
        role,
      });

      return res.json({ message: 'User created successfully' });
    } catch (err) {
      console.error(err);
      next(ApiError.internal('Error creating user'));
    }
  }
  async uploadAvatar(req, res, next) {
    try {
      const userId = req.user.id;

      if (!req.files || !req.files.img) {
        return next(ApiError.badRequest('No file uploaded'));
      }

      const { img } = req.files;

      // const fileName = uuid.v4() + '.jpg';
      const fileName = uuid.v4() + '.webp';
      const filepath = path.resolve(__dirname, '..', 'static', fileName);

      await sharp(img.data).webp({ quality: 80 }).toFile(filepath);

      const user = await User.findById(userId);
      if (!user) {
        return next(ApiError.badRequest('User not found'));
      }

      await User.update(userId, { avatar: fileName });
      return res.json({ message: 'Avatar uploaded successfully' });
    } catch (err) {
      console.error(err);
      next(ApiError.internal('Error uploading avatar'));
    }
  }
  async updateUser(req, res, next) {
    try {
      const { user_id } = req.params;
      let { fullName, email, isOfficial } = req.body;

      const user = await User.findById(user_id);
      if (!user) {
        return next(ApiError.badRequest('User not found'));
      }

      let updateData = {};

      if (fullName !== undefined) updateData.fullName = fullName;
      if (email !== undefined) updateData.email = email;
      if (isOfficial !== undefined) updateData.isOfficial = isOfficial;

      if (
        Object.keys(updateData).length < 0 ||
        Object.keys(updateData).length === 0
      ) {
        return next(ApiError.badRequest('No fields to update'));
      }

      if (fullName !== undefined && fullName.trim() === '') {
        return next(ApiError.badRequest('Field "fullName" cannot be empty'));
      }

      if (email !== undefined && email.trim() === '') {
        return next(ApiError.badRequest('Field "email" cannot be empty'));
      }

      const candidateEmail = await User.findOne({ email });
      if (candidateEmail) {
        return next(ApiError.badRequest('User with this email already exists'));
      }

      await User.update(user_id, updateData);
      return res.json({ message: 'User updated successfully' });
    } catch (err) {
      console.error(err);
      next(ApiError.internal('Error updating user'));
    }
  }
  async deleteUser(req, res, next) {
    try {
      const { user_id } = req.params;

      const user = await User.findById(user_id);
      if (!user) {
        return next(ApiError.badRequest('User not found'));
      }

      if (user.avatar) {
        const img = path.resolve(__dirname, '..', 'static', user.avatar);
        if (fs.existsSync(img)) {
          fs.unlinkSync(img);
        }
      }

      await User.delete(user_id);
      return res.json({ message: 'User deleted successfully' });
    } catch (err) {
      console.error(err);
      next(ApiError.internal('Error deleting user'));
    }
  }
}

module.exports = new UserControllers();
