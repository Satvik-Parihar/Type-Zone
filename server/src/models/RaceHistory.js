const mongoose = require('mongoose');

const raceHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    roomId: {
      type: String,
      required: true,
      index: true
    },
    roomName: {
      type: String,
      required: true
    },
    placement: {
      type: Number,
      required: true,
      min: 1
    },
    participants: {
      type: Number,
      required: true,
      min: 1
    },
    wpm: {
      type: Number,
      required: true,
      min: 0
    },
    accuracy: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    finishTime: {
      type: Number,
      required: true,
      min: 0
    },
    isWinner: {
      type: Boolean,
      default: false
    },
    raceTextSnippet: {
      type: String,
      default: ''
    },
    finishedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

raceHistorySchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('RaceHistory', raceHistorySchema);