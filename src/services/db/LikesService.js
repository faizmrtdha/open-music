const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class LikesService {
  constructor(albumsService, cacheService) {
    this._pool = new Pool();
    this._albumsService = albumsService;
    this._cacheService = cacheService;
  }

  async addLike(albumId, userId) {
    await this._albumsService.getAlbumById(albumId);

    const cekLike = await this.checkLike(albumId, userId);
    if (!cekLike) {
      const id = `ual-${nanoid(16)}`;

      const query = {
        text: 'INSERT INTO user_album_likes VALUES($1, $2, $3) RETURNING id',
        values: [id, userId, albumId],
      };

      const result = await this._pool.query(query);

      if (!result.rows[0].id) {
        throw new InvariantError('Like gagal ditambahkan');
      }

      await this._cacheService.delete(`likes:${albumId}`);

      return {
        message: 'Berhasil menyukai album',
        data: {
          id: result.rows[0].id,
        },
      };
    }
    await this._cacheService.delete(`likes:${albumId}`);

    const hapusLike = await this.deleteLike(albumId, userId);

    return hapusLike;
  }

  async getAlbumLikes(id) {
    try {
      const result = await this._cacheService.get(`likes:${id}`);
      return { likes: JSON.parse(result) };
    } catch (error) {
      const query = {
        text: 'SELECT COUNT(*) FROM user_album_likes WHERE album_id = $1',
        values: [id],
      };
      const result = await this._pool.query(query);

      if (!result.rowCount) {
        throw new NotFoundError('Album tidak ditemukan');
      }

      await this._cacheService.set(`likes:${id}`, result.rows[0].count, 1800);

      return parseInt(result.rows[0].count, 10);
    }
  }

  async checkLike(albumId, userId) {
    const query = {
      text: 'SELECT * FROM user_album_likes WHERE album_id = $1 AND user_id = $2',
      values: [albumId, userId],
    };
    const result = await this._pool.query(query);

    return result.rowCount > 0;
  }

  async deleteLike(albumId, userId) {
    const query = {
      text: 'DELETE FROM user_album_likes WHERE user_id = $1 AND album_id = $2 RETURNING id',
      values: [userId, albumId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Album tidak ditemukan');
    }
    return {
      message: 'Batal menyukai album',
      data: {
        id: result.rows[0].id,
      },
    };
  }
}

module.exports = LikesService;
