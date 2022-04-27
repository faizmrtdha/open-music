/* eslint-disable no-underscore-dangle */
class PlaylistsHandler {
  constructor(playlistsService, songsService, validator) {
    this._playlistsService = playlistsService;
    this._songsService = songsService;
    this._validator = validator;

    this.addPlaylistHandler = this.addPlaylistHandler.bind(this);
    this.getPlaylistsHandler = this.getPlaylistsHandler.bind(this);
    this.deletePlaylistsHandler = this.deletePlaylistsHandler.bind(this);
    this.addSongsPlaylistsHandler = this.addSongsPlaylistsHandler.bind(this);
    this.getSongsPlaylistHandler = this.getSongsPlaylistHandler.bind(this);
    this.deleteSongsPlaylistsHandler = this.deleteSongsPlaylistsHandler.bind(this);
    this.getPlaylistSongsActivitiesHandler = this.getPlaylistSongsActivitiesHandler.bind(this);
  }

  async addPlaylistHandler(request, h) {
    this._validator.validatePostPlaylistPayload(request.payload);
    const { name } = request.payload;
    const { id: owner } = request.auth.credentials;
    const playlistId = await this._playlistsService.addPlaylist({ name, owner });

    const response = h.response({
      status: 'success',
      data: {
        playlistId,
      },
    });
    response.code(201);
    return response;
  }

  async getPlaylistsHandler(request) {
    const { id: owner } = request.auth.credentials;
    const playlists = await this._playlistsService.getPlaylists(owner);
    return {
      status: 'success',
      data: {
        playlists,
      },
    };
  }

  async deletePlaylistsHandler(request) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._playlistsService.verifyPlaylistOwner(id, credentialId);
    await this._playlistsService.deletePlaylistById(id);

    return {
      status: 'success',
      message: 'Playlist berhasil dihapus',
    };
  }

  async addSongsPlaylistsHandler(request, h) {
    const { playlistId } = request.params;
    const { id: credentialId } = request.auth.credentials;
    this._validator.validatePostSongPlaylistPayload({ ...request.payload, playlistId });

    await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId);
    await this._songsService.verifySong(request.payload);
    const playlistSongId = await this._playlistsService.addSongToPlaylist(
      { ...request.payload, playlistId },
      credentialId,
    );

    const response = h.response({
      status: 'success',
      message: 'Song berhasil di tambahkan ke playlist',
      data: {
        playlistSongId,
      },
    });
    response.code(201);
    return response;
  }

  async getSongsPlaylistHandler(request, h) {
    const { playlistId } = request.params;
    const { id: credentialId } = request.auth.credentials;
    await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId);

    const playlist = await this._playlistsService.getPlaylistSongs(request.params);

    const response = h.response({
      status: 'success',
      message: 'List song playlist berhasil didapat',
      data: {
        playlist,
      },
    });
    return response;
  }

  async deleteSongsPlaylistsHandler(request, h) {
    const { playlistId } = request.params;
    this._validator.validateDeleteSongPlaylistPayload({ ...request.params, ...request.payload });
    const { id: credentialId } = request.auth.credentials;
    await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId);

    await this._playlistsService.deletePlaylistSongs(
      { ...request.params, ...request.payload },
      credentialId,
    );

    const response = h.response({
      status: 'success',
      message: 'List song playlist berhasil dihapus',
    });
    return response;
  }

  async getPlaylistSongsActivitiesHandler(request, h) {
    const { id: credentialId } = request.auth.credentials;
    const { playlistId } = request.params;
    await this._playlistsService.verifyPlaylistOwner(playlistId, credentialId);

    const activities = await this._playlistsService.getPlaylistSongActivities({ playlistId });

    const response = h.response({
      status: 'success',
      data: {
        playlistId,
        activities,
      },
    });
    return response;
  }
}

module.exports = PlaylistsHandler;
