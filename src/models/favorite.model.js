import mongoose from 'mongoose';

const favoriteSchema = new mongoose.Schema(
  {
    tenantRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Tenant reference is required'],
    },
    listingRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Listing',
      required: [true, 'Listing reference is required'],
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index to prevent duplicate saves
favoriteSchema.index({ tenantRef: 1, listingRef: 1 }, { unique: true });

const Favorite = mongoose.model('Favorite', favoriteSchema);

export default Favorite;
