/* eslint-disable camelcase */

exports.up = (pgm) => {
  pgm.createTable('user_album_likes', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    user_id: {
      type: 'TEXT',
    },
    album_id: {
      type: 'TEXT',
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('user_album_likes');
};
