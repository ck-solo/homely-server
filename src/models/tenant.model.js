import mongoose from "mongoose";

const roommatePreferencesSchema = new mongoose.Schema(
  {
    budget: {
      min: {
        type: Number,
        default: 0,
        min: [0, "Minimum budget cannot be negative"],
      },
      max: {
        type: Number,
        default: 0,
        min: [0, "Maximum budget cannot be negative"],
      },
    },
    foodHabits: {
      type: String,
      enum: {
        values: ["VEGETARIAN", "NON_VEGETARIAN", "ANY", "VEGAN"],
        message: "{VALUE} is not a valid food habit preference",
      },
      default: "ANY",
    },
    smokingPreference: {
      type: Boolean,
      default: false,
    },
    sleepingSchedule: {
      type: String,
      enum: {
        values: ["EARLY_BIRD", "NIGHT_OWL", "FLEXIBLE"],
        message: "{VALUE} is not a valid sleeping schedule preference",
      },
      default: "FLEXIBLE",
    },
    lifestyleDetails: {
      type: [String],
      default: [],
    },
  },
  { _id: false },
);

const tenantProfileSchema = new mongoose.Schema(
  {
    userRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"],
      unique: true,
    },
    bio: {
      type: String,
      trim: true,
      maxlength: [500, "Bio cannot exceed 500 characters"],
    },
    occupation: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      required: [true, "City is required"],
      trim: true,
    },
    gender: {
      type: String,
      enum: {
        values: ["MALE", "FEMALE", "NON_BINARY", "OTHER", "PREFER_NOT_TO_SAY"],
        message: "{VALUE} is not a valid gender option",
      },
      required: [true, "Gender is required"],
    },
    age: {
      type: Number,
      required: [true, "Age is required"],
      min: [18, "Age must be at least 18"],
      max: [120, "Please provide a valid age"],
    },
    profilePicture: {
      type: String,
      trim: true,
    },
    roommatePreferences: {
      type: roommatePreferencesSchema,
      default: () => ({}),
    },
  },
  {
    timestamps: true,
  },
);

// Pre-validation hook to ensure roommate preferences budget max is >= min
// tenantProfileSchema.pre('validate', function (next) {
//   if (
//     this.roommatePreferences &&
//     this.roommatePreferences.budget &&
//     this.roommatePreferences.budget.max < this.roommatePreferences.budget.min
//   ) {
//     this.invalidate(
//       'roommatePreferences.budget.max',
//       'Maximum budget preference must be greater than or equal to minimum budget preference'
//     );
//   }
//   next();
// });

// // Indexes
// tenantProfileSchema.index({ city: 1 });
// tenantProfileSchema.index({ 'roommatePreferences.budget.min': 1, 'roommatePreferences.budget.max': 1 });

const TenantProfile = mongoose.model("TenantProfile", tenantProfileSchema);

export default TenantProfile;
