import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema(
  {
    participants: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
      ],
      validate: {
        validator: function (val) {
          return val && val.length >= 2;
        },
        message: 'A conversation must have at least 2 participants.',
      },
      required: [true, 'Participants are required'],
    },
    lastMessage: {
      type: String,
      trim: true,
    },
    lastMessageSentAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Index participants array for quick chat lookups
conversationSchema.index({ participants: 1 });

const Conversation = mongoose.model('Conversation', conversationSchema);

export default Conversation;
