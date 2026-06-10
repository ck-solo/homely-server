import mongoose from "mongoose";
import TenantProfile from "./tenant.model.js";
import Listing from "./listing.model.js";

const favoriteSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TenantProfile",
      required: [true, "Tenant ID is required"],
    },
    listingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Listing",
      required: [true, "Listing ID is required"],
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index to prevent duplicate bookmarks
favoriteSchema.index({ tenantId: 1, listingId: 1 }, { unique: true });

const Favorite = mongoose.model("Favorite", favoriteSchema);

export default Favorite;
