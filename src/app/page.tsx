import { Metadata } from 'next';
import HomePage from './HomePage';
import connectDB from '@/lib/db';
import HeroSettings from '@/models/HeroSettings';

import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Hot N Cool Restaurant - The taste of flavour',
  description: 'Experience authentic dining at Hot N Cool Restaurant in Qatar. Multiple locations including Muaither, Al Mearad/Sailiya, and Madinat Khalifa offering freshly prepared meals, snacks, and drinks 24/7 with fast delivery.',
  keywords: 'hot n cool restaurant, qatar restaurant, muaither branch, al mearad branch, sailiya branch, madinat khalifa branch, 24/7 restaurant, food delivery qatar, authentic flavors, indian arabic international cuisine',

  openGraph: {
    title: 'Hot N Cool Restaurant - The taste of flavour',
    description: 'Experience authentic dining at Hot N Cool Restaurant in Qatar. Multiple locations including Muaither, Al Mearad/Sailiya, and Madinat Khalifa offering freshly prepared meals, snacks, and drinks 24/7 with fast delivery.',
  }
}

async function getHeroSettings() {
  try {
    await connectDB();
    // Query the raw MongoDB collection directly to bypass Mongoose schema caching issues
    const db = mongoose.connection.db;
    if (db) {
      const settings = await db.collection('herosettings').findOne({}, { sort: { createdAt: -1 } });
      if (settings) {
        return {
          bannerImageUrl: (settings.bannerImageUrl || '') as string,
          mobileBannerImageUrl: (settings.mobileBannerImageUrl || '') as string,
        };
      }
    } else {
      // Fallback
      const settings = await HeroSettings.findOne().sort({ createdAt: -1 }).lean();
      if (settings) {
        return {
          bannerImageUrl: settings.bannerImageUrl as string,
          mobileBannerImageUrl: (settings.mobileBannerImageUrl || '') as string,
        };
      }
    }
    return null;
  } catch (error) {
    console.error('Failed to fetch hero settings:', error);
    return null;
  }
}

export default async function Page() {
  const initialData = await getHeroSettings();
  return <HomePage initialHeroSettings={initialData} />
}
