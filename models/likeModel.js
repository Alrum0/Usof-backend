const BaseModel = require('./baseModel');
const db = require('../db');

class Comment extends BaseModel {
  constructor() {
    super('likes');
  }
}

module.exports = new Comment();
