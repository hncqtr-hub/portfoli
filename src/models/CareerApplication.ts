import mongoose from 'mongoose';

const CareerApplicationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  position: {
    type: String,
    required: true,
    maxlength: [20, 'Position cannot be more than 20 characters'],
  },
  message: {
    type: String,
    required: true,
    maxlength: [100, 'Message cannot be more than 100 characters'],
  },
  resume: {
    type: String, // URL to the uploaded resume
  },
  status: {
    type: String,
    enum: ['new', 'reviewed', 'shortlisted', 'rejected'],
    default: 'new',
  },
  isDeleted: {
    type: Boolean,
    default: false,
  }
}, { timestamps: true });

// Delete model if likely to cause schema conflict in dev
if (process.env.NODE_ENV === 'development' && mongoose.models.CareerApplication) {
  delete mongoose.models.CareerApplication;
}

export default mongoose.models.CareerApplication || mongoose.model('CareerApplication', CareerApplicationSchema);
