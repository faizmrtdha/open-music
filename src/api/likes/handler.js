class LikesHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    this.postAlbumsLikeHandler = this.postAlbumsLikeHandler.bind(this);
    this.getAlbumLikesHandler = this.getAlbumLikesHandler.bind(this);
  }

  async postAlbumsLikeHandler(request, h) {
    const { id: albumId } = request.params;
    const { id: userId } = request.auth.credentials;
    this._validator.validateLikePayload({ albumId });

    const like = await this._service.addLike(albumId, userId);
    const response = h.response({
      status: 'success',
      ...like,
    });
    response.code(201);
    return response;
  }

  async getAlbumLikesHandler(request, h) {
    const { id } = request.params;

    const likes = await this._service.getAlbumLikes(id);

    if (typeof likes === 'object') {
      const response = h.response({
        status: 'success',
        data: {
          ...likes,
        },
      });
      response.header('X-Data-Source', 'cache');
      return response;
    }
    const response = h.response({
      status: 'success',
      data: {
        likes,
      },
    });
    return response;
  }
}

module.exports = LikesHandler;
