const { LikePayloadSchema } = require('./schema');
const InvariantError = require('../../exceptions/InvariantError');

const LikesValidator = {
  validateLikePayload: (payload) => {
    const validationResult = LikePayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = LikesValidator;
