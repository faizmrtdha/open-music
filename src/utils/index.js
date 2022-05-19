/* eslint-disable object-curly-newline */
const mapDBAlbumToModel = ({ id, name, year, cover }) => ({
  id,
  name,
  year,
  coverUrl: cover,
});

const mapDBSongToModel = ({ id, title, year, performer, genre, duration, albumId }) => ({
  id,
  title,
  year,
  performer,
  genre,
  duration,
  albumId,
});

module.exports = { mapDBAlbumToModel, mapDBSongToModel };
