import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [false, 'Please provide a name for this user.'],
      maxlength: [60, 'Name cannot be more than 60 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email for this user.'],
      unique: true,
      maxlength: [60, 'Email cannot be more than 60 characters'],
    },
    phoneNumber: {
      type: String,
      required: false,
      maxlength: [20, 'Phone number cannot be more than 20 characters'],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password for this user.'],
    },
    role: {
      type: String,
      enum: ['superadmin', 'superAdmin', 'admin', 'staff'],
      default: 'staff',
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);
// Prevent mongoose from creating a new model if it already exists, unless we are in dev and want to force schema update
if (process.env.NODE_ENV === 'development' && mongoose.models.User) {
  delete mongoose.models.User;
}

export default mongoose.models.User || mongoose.model('User', UserSchema);

