const routes = (handler) => [
  {
    method: 'POST',
    path: '/export/playlists/{playlistId}',
    handler: handler.exportPlaylistsHandler,
    options: {
      auth: 'openmusic_jwt',
    },
  },
];

module.exports = routes;
