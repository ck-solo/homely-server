import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: [true, "Conversation ID is required"],
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Sender reference is required"],
    },
    content: {
      type: String,
      trim: true,
      maxlength: [5000, "Content cannot exceed 5000 characters"],
      required: [
        function () {
          return !this.attachments || this.attachments.length === 0;
        },
        "Message content is required if there are no attachments.",
      ],
    },
    attachments: {
      type: [String],
      default: [],
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

// Compound index on conversationId and createdAt for rapid paginated chat rendering
// messageSchema.index({ conversationId: 1, createdAt: -1 });

const Message = mongoose.model("Message", messageSchema);

export default Message;
