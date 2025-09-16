const db = require('../db');

class BaseModel {
  constructor(tableName) {
    this.tableName = tableName;
  }

  async findAll(condition) {
    if (!condition) {
      const [rows] = await db.query(`SELECT * FROM ${this.tableName}`);
      return rows;
    }

    const keys = Object.keys(condition);
    const values = Object.values(condition);
    const whereClause = keys.map((key) => `${key} = ?`).join(' AND ');

    const [rows] = await db.query(
      `SELECT * FROM ${this.tableName} WHERE ${whereClause}`,
      values
    );

    return rows;
  }

  async findById(id) {
    const [rows] = await db.query(
      `SELECT * FROM ${this.tableName} WHERE id = ?`,
      [id]
    );
    return rows[0] || null;
  }

  async create(data) {
    const keys = Object.keys(data).join(', ');
    const values = Object.values(data);
    const placeholders = values.map(() => '?').join(',');

    const result = await db.query(
      `INSERT INTO ${this.tableName} (${keys}) VALUES (${placeholders})`,
      values
    );
    return { id: result[0].insertId, ...data };
  }

  async update(id, data) {
    const keys = Object.keys(data)
      .map((key) => `${key} = ?`)
      .join(',');
    const values = Object.values(data);

    await db.query(`UPDATE ${this.tableName} SET ${keys} WHERE id = ?`, [
      ...values,
      id,
    ]);

    return this.findById(id);
  }

  async delete(id) {
    await db.query(`DELETE FROM ${this.tableName} WHERE id = ?`, [id]);
    return true;
  }

  async deleteAll(data) {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const whereClause = keys.map((key) => `${key} = ? `).join(' AND ');
    await db.query(
      `DELETE FROM ${this.tableName} WHERE ${whereClause}`,
      values
    );
  }

  async findOne(condition) {
    const keys = Object.keys(condition);
    const values = Object.values(condition);
    const whereClause = keys.map((key) => `${key} = ? `).join(' AND ');

    const [rows] = await db.query(
      `SELECT * FROM ${this.tableName} WHERE ${whereClause} LIMIT 1`,
      values
    );

    return rows[0] || null;
  }
}

module.exports = BaseModel;
