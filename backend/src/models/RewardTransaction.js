const mongoose = require('mongoose');

const rewardTransactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['EARN', 'REDEEM', 'ADJUSTMENT', 'BONUS'],
      required: true,
    },
    points: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    referenceId: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

rewardTransactionSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('RewardTransaction', rewardTransactionSchema);
