const Joi = require('joi');

const LikePayloadSchema = Joi.object({
  albumId: Joi.string().required(),
});

module.exports = { LikePayloadSchema };
