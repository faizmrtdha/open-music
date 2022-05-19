class ExportsHandler {
  constructor(ProducerService, playlistsService, validator) {
    this._ProducerService = ProducerService;
    this._playlistsService = playlistsService;
    this._validator = validator;

    this.exportPlaylistsHandler = this.exportPlaylistsHandler.bind(this);
  }

  async exportPlaylistsHandler(request, h) {
    const { playlistId } = request.params;
    const { id: credentialId } = request.auth.credentials;
    this._validator.validateExportPlaylistsPayload({ playlistId, ...request.payload });

    await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId);

    const message = {
      playlistId,
      targetEmail: request.payload.targetEmail,
    };

    await this._ProducerService.sendMessage('export:playlists', JSON.stringify(message));

    const response = h.response({
      status: 'success',
      message: 'Permintaan Anda dalam antrean',
    });
    response.code(201);
    return response;
  }
}

module.exports = ExportsHandler;
