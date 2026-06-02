import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Reporter reference is required"],
    },
    reportedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    reportedListing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Listing",
      default: null,
    },
    reason: {
      type: String,
      required: [true, "Reason for report is required"],
      trim: true,
      maxlength: [1000, "Reason cannot exceed 1000 characters"],
    },
    status: {
      type: String,
      enum: {
        values: ["PENDING", "REVIEWED", "RESOLVED"],
        message: "{VALUE} is not a valid report status",
      },
      default: "PENDING",
    },
  },
  {
    timestamps: true,
  },
);

// Indexes for administrative searches and filtering
// reportSchema.index({ status: 1 });
// reportSchema.index({ reporter: 1 });
// reportSchema.index({ reportedUser: 1 });
// reportSchema.index({ reportedListing: 1 });

const Report = mongoose.model("Report", reportSchema);

export default Report;
