const ApiError = require('../error/ApiError');
const bcrypt = require('bcrypt');
const uuid = require('uuid');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

const User = require('../models/user');
const Subscription = require('../models/subscriptionModel');

class UserControllers {
  async getUser(req, res, next) {
    try {
      const { user_id } = req.params;

      const user = await User.findById(user_id);
      if (!user) {
        return next(ApiError.badRequest('User not found'));
      }
      const publicData = {
        id: user.id,
        login: user.login,
        avatar: user.avatar,
        fullName: user.fullName,
        isVeriffied: user.isVeriffied,
        rating: user.rating,
      };
      return res.json(publicData);
    } catch (err) {
      console.error(err);
    }
  }
  async getAllUsers(req, res, next) {
    try {
      const { search } = req.query;
      const isAdmin = req.user.role === 'ADMIN';

      let users;
      if (search) {
        users = await User.findByLoginOrName(search);
      } else {
        users = await User.findAll();
      }

      if (isAdmin) {
        const adminData = users.map((u) => {
          const { password, ...rest } = u;
          return rest;
        });
        return res.json(adminData);
      }

      const publicData = users.map((u) => ({
        id: u.id,
        login: u.login,
        fullName: u.fullName,
        avatar: u.avatar,
        isVeriffied: u.isVeriffied,
        rating: u.rating,
      }));

      return res.json(publicData);
    } catch (err) {
      console.error(err);
    }
  }
  async createUser(req, res, next) {
    try {
      const { login, fullName, email, password, confirmPassword, role } =
        req.body;

      if (req.user.role !== 'ADMIN') {
        return next(
          ApiError.forbidden(
            'You do not have permission to access this resource'
          )
        );
      }

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

      if (req.user.role !== 'ADMIN' && req.user.id !== userId) {
        return next(
          ApiError.forbidden(
            'You do not have permission to access this resource'
          )
        );
      }

      if (!req.files || !req.files.img) {
        return next(ApiError.badRequest('No file uploaded'));
      }

      const { img } = req.files;

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
      let { fullName, email, isOfficial, stars } = req.body;

      const user = await User.findById(user_id);
      if (!user) {
        return next(ApiError.badRequest('User not found'));
      }

      const isAdmin = req.user.role === 'ADMIN';
      const isSelf = req.user.id === user.id;

      if (!isAdmin && !isSelf) {
        return next(
          ApiError.forbidden(
            'You do not have permission to access this resource'
          )
        );
      }

      let updateData = {};

      if (isAdmin || isSelf) {
        if (fullName !== undefined) {
          if (fullName.trim() === '') {
            return next(
              ApiError.badRequest('Field "fullName" cannot be empty')
            );
          }
          updateData.fullName = fullName;
        }

        if (email !== undefined) {
          if (email.trim() === '') {
            return next(ApiError.badRequest('Field "email" cannot be empty'));
          }

          const candidateEmail = await User.findOne({ email });
          if (candidateEmail) {
            return next(
              ApiError.badRequest('User with this email already exists')
            );
          }

          updateData.email = email;
        }
      }

      if (isAdmin) {
        if (isOfficial !== undefined) updateData.isOfficial = isOfficial;
        if (stars !== undefined) updateData.stars = stars;
      }

      if (
        Object.keys(updateData).length < 0 ||
        Object.keys(updateData).length === 0
      ) {
        return next(ApiError.badRequest('No fields to update'));
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

      if (req.user.role !== 'ADMIN' && req.user.id !== user.id) {
        return next(
          ApiError.forbidden(
            'You do not have permission to access this resource'
          )
        );
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
  // ---- ---- --- --- -
  async getUserStars(req, res, next) {
    try {
      const { user_id } = req.params;
      const user = await User.findById(user_id);
      if (!user) {
        return next(ApiError.badRequest('User not found'));
      }

      if (req.user.role !== 'ADMIN' && req.user.id !== user.id) {
        return next(
          ApiError.forbidden(
            'You do not have permission to access this resource'
          )
        );
      }

      return res.json({ stars_balance: user.stars_balance });
    } catch (err) {
      console.error(err);
      return next(ApiError.internal('Error fetching user stars'));
    }
  }
  async addStars(req, res, next) {
    try {
      const userId = req.user.id;
      const { stars } = req.body;

      if (!stars || stars <= 0) {
        return next(ApiError.badRequest('Stars must be more than 0'));
      }

      await User.updateStarsBalance(userId, stars);

      return res.json({ message: 'Stars added successfully' });
    } catch (err) {
      console.error(err);
      return next(ApiError.internal('Failed to add stars to your account'));
    }
  }

  async followUser(req, res, next) {
    try {
      const followerId = req.user.id;
      const { user_id: followingId } = req.params;

      if (followerId === parseInt(followingId)) {
        return next(ApiError.badRequest('You cannot follow yourself'));
      }

      if (!followingId) {
        return next(ApiError.badRequest('User ID is required'));
      }

      const userToFollow = await User.findById(followingId);
      if (!userToFollow) {
        return next(ApiError.badRequest('User not found'));
      }

      const alreadyFollowing = await Subscription.findOne({
        followerId,
        followingId,
      });

      if (alreadyFollowing) {
        return next(ApiError.badRequest('You are already following this user'));
      }

      await Subscription.create({ followerId, followingId });
      return res.json({ message: 'Successfully followed the user' });
    } catch (err) {
      console.error(err);
      return next(ApiError.internal('Error following user'));
    }
  }

  async unfollowUser(req, res, next) {
    try {
      const followerId = req.user.id;
      const { user_id: followingId } = req.params;

      const subscription = await Subscription.findOne({
        followerId,
        followingId,
      });

      if (!subscription) {
        return next(ApiError.badRequest('You are not following this user'));
      }

      await Subscription.deleteAll({ followerId, followingId });
      return res.json({ message: 'Successfully unfollowed the user' });
    } catch (err) {
      console.error(err);
      return next(ApiError.internal('Error unfollowing user'));
    }
  }

  async getFollowers(req, res, next) {
    try {
      const { user_id } = req.params;

      const user = await User.findById(user_id);
      if (!user) {
        return next(ApiError.badRequest('User not found'));
      }

      const followers = await Subscription.getFollowers(user_id);
      return res.json(followers);
    } catch (err) {
      console.error(err);
      return next(ApiError.internal('Error fetching followers'));
    }
  }

  async getFollowing(req, res, next) {
    try {
      const { user_id } = req.params;

      const user = await User.findById(user_id);
      if (!user) {
        return next(ApiError.badRequest('User not found'));
      }

      const following = await Subscription.getFollowing(user_id);
      if (!following) {
        return next(ApiError.badRequest('User not found'));
      }
      return res.json(following);
    } catch (err) {
      console.error(err);
      return next(ApiError.internal('Error fetching following users'));
    }
  }

  async getUserRating(req, res, next) {
    try {
      const { user_id } = req.params;

      const user = await User.findById(user_id);
      if (!user) {
        return next(ApiError.badRequest('User not found'));
      }

      const rating = await User.getUserRating(user_id);

      await User.update(user_id, { rating });

      return res.json({ user_id, rating });
    } catch (err) {
      console.error(err);
      return next(ApiError.internal('Error fetching user rating'));
    }
  }
}

module.exports = new UserControllers();
