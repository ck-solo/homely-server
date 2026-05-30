import mongoose from 'mongoose';

const ownerProfileSchema = new mongoose.Schema(
  {
    userRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      unique: true,
    },
    businessName: {
      type: String,
      required: [true, 'Business name is required'],
      trim: true,
      maxlength: [150, 'Business name cannot exceed 150 characters'],
    },
    businessDetails: {
      type: String,
      trim: true,
      maxlength: [1000, 'Business details cannot exceed 1000 characters'],
    },
    profilePicture: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);



const OwnerProfile = mongoose.model('OwnerProfile', ownerProfileSchema);

export default OwnerProfile;
