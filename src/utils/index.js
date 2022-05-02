/* eslint-disable camelcase */
/* eslint-disable object-curly-newline */
/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
const mapDBAlbumToModel = ({ id, name, year }) => ({
  id,
  name,
  year,
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
