import mongoose from 'mongoose';

const HeroSettingsSchema = new mongoose.Schema({
  bannerImageUrl: {
    type: String,
    default: '',
  },
  mobileBannerImageUrl: {
    type: String,
    default: '',
  },
  openingSoonImages: {
    type: [String],
    default: [],
  },
  offerImages: {
    type: [String],
    default: [],
  },
}, { timestamps: true });

// Using V6 to force schema update without server restart
export default mongoose.models.HeroSettingsV6 || mongoose.model('HeroSettingsV6', HeroSettingsSchema, 'herosettings');
