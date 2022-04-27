/* eslint-disable no-shadow */
/* eslint-disable no-underscore-dangle */
const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthorizationError = require('../../exceptions/AuthorizationError');

class PlaylistsService {
  constructor(collaborationsService) {
    this._pool = new Pool();
    this._collaborationsService = collaborationsService;
  }

  async addPlaylist({ name, owner }) {
    const id = `playlist-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO playlists VALUES($1, $2, $3) RETURNING id',
      values: [id, name, owner],
    };

    const result = await this._pool.query(query);
    if (!result.rows[0].id) {
      throw new InvariantError('Playlist gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getPlaylists(owner) {
    const query = {
      text: 'SELECT p.id, p.name, u.username FROM playlists p INNER JOIN users u ON p.owner = u.id INNER JOIN collaborations c ON c.playlist_id = p.id WHERE p.owner = $1 OR c.user_id = $1',
      values: [owner],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      const query = {
        text: 'SELECT playlists.id, playlists.name, users.username FROM playlists INNER JOIN users ON playlists.owner = users.id WHERE playlists.owner = $1',
        values: [owner],
      };
      const result = await this._pool.query(query);
      return result.rows;
    }
    return result.rows;
  }

  async deletePlaylistById(id) {
    const query = {
      text: 'DELETE FROM playlists WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Playlist gagal dihapus. Id tidak ditemukan');
    }
  }

  async verifyPlaylistOwner(id, owner) {
    const query = {
      text: 'SELECT owner FROM playlists WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }
    const playlist = result.rows[0];
    if (playlist.owner !== owner) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }
  }

  async verifyPlaylistAccess(playlistId, userId) {
    try {
      await this.verifyPlaylistOwner(playlistId, userId);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      try {
        await this._collaborationsService.verifyCollaborator(playlistId, userId);
      } catch {
        throw error;
      }
    }
  }

  async addSongToPlaylist({ playlistId, songId }, userId) {
    const id = nanoid(16);

    const query = {
      text: 'INSERT INTO playlistsongs VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Songs gagal ditambahkan');
    }

    this.playlistSongsActivities(playlistId, songId, userId, 'add');

    return result.rows[0].id;
  }

  async getPlaylistSongs({ playlistId }) {
    const queryPlaylist = {
      text: 'SELECT playlists.id, playlists.name, users.username FROM playlistsongs ps INNER JOIN playlists ON playlists.id = ps.playlist_id INNER JOIN users ON playlists.owner = users.id WHERE ps.playlist_id = $1',
      values: [playlistId],
    };
    const querySongs = {
      text: 'SELECT songs.id, songs.title, songs.performer FROM playlistsongs ps INNER JOIN songs ON songs.id = ps.song_id WHERE ps.playlist_id = $1',
      values: [playlistId],
    };
    const resultPlaylist = await this._pool.query(queryPlaylist);
    const resultSongs = await this._pool.query(querySongs);

    return {
      ...resultPlaylist.rows[0],
      songs: resultSongs.rows,
    };
  }

  async deletePlaylistSongs({ playlistId, songId }, userId) {
    const query = {
      text: 'DELETE FROM playlistsongs WHERE playlist_id = $1 AND song_id = $2 RETURNING id',
      values: [playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Playlist gagal dihapus. Id tidak ditemukan');
    }

    this.playlistSongsActivities(playlistId, songId, userId, 'delete');
  }

  async playlistSongsActivities(playlistId, songId, userId, action) {
    const id = `psa-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO playlist_song_activities VALUES($1, $2, $3, $4, $5) RETURNING id',
      values: [id, playlistId, songId, userId, action],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Activities gagal ditambahkan');
    }
  }

  async getPlaylistSongActivities({ playlistId }) {
    const query = {
      text: 'SELECT users.username, songs.title, action, time FROM playlist_song_activities psa INNER JOIN songs ON psa.song_id = songs.id INNER JOIN users ON psa.user_id = users.id WHERE psa.playlist_id = $1',
      values: [playlistId],
    };

    const result = await this._pool.query(query);

    return result.rows;
  }
}

module.exports = PlaylistsService;
