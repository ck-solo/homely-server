import mongoose from "mongoose";

const locationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["Point"],
      required: true,
      default: "Point",
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
      validate: {
        validator: function (val) {
          return (
            val.length === 2 &&
            val[0] >= -180 &&
            val[0] <= 180 &&
            val[1] >= -90 &&
            val[1] <= 90
          );
        },
        message:
          "Coordinates must be [longitude, latitude] where longitude is between -180 and 180, and latitude is between -90 and 90.",
      },
    },
  },
  { _id: false },
);

const listingSchema = new mongoose.Schema(
  {
    ownerRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Owner reference is required"],
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    city: {
      type: String,
      required: [true, "City is required"],
      trim: true,
    },
    location: {
      type: locationSchema,
      required: [true, "Location coordinates are required"],
    },
    rentBudget: {
      type: Number,
      required: [true, "Rent budget is required"],
      min: [0, "Rent budget cannot be negative"],
    },
    propertyType: {
      type: String,
      enum: {
        values: ["PG", "Hostel", "Flat", "Apartment", "House"],
        message: "{VALUE} is not a valid property type",
      },
      required: [true, "Property type is required"],
    },
    genderPreference: {
      type: String,
      enum: {
        values: ["Male", "Female", "Co-ed"],
        message: "{VALUE} is not a valid gender preference option",
      },
      required: [true, "Gender preference is required"],
      default: "Co-ed",
    },
    amenities: {
      type: [String],
      default: [],
    },
    images: {
      type: [String],
      default: [],
    },
    availabilityStatus: {
      type: Boolean,
      default: true,
    },
    approvalStatus: {
      type: String,
      enum: {
        values: ["PENDING", "APPROVED", "REJECTED"],
        message: "{VALUE} is not a valid approval status",
      },
      default: "PENDING",
    },
  },
  {
    timestamps: true,
  },
);

// Performance indexes
listingSchema.index({ city: 1 });
listingSchema.index({ rentBudget: 1 });
listingSchema.index({ ownerRef: 1 });
listingSchema.index({ propertyType: 1 });
listingSchema.index({ availabilityStatus: 1 });
listingSchema.index({ approvalStatus: 1 });

// GeoJSON index for proximity searches
listingSchema.index({ location: '2dsphere' });

// Full-text search index for Search module optimization
listingSchema.index(
  { title: 'text', description: 'text', city: 'text' },
  { weights: { title: 10, city: 5, description: 1 } }
);

const Listing = mongoose.model("Listing", listingSchema);

export default Listing;
