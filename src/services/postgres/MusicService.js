const { Pool } = require("pg");
const { nanoid } = require("nanoid");

class MusicService {
  constructor() {
    this._pool = new Pool();
  }

  async addAlbum({ name, year }) {
    const id = nanoid(16);
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;
  }
}

module.exports = MusicService;
