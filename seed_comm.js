
import mongoose from 'mongoose';
import { MONGO_URI } from './src/config/siteEnv.js';
import { CommercialProject } from './src/models/commercialProjectModel.js';

mongoose.connect(MONGO_URI).then(async () => {
  const count = await CommercialProject.countDocuments();
  if (count === 0) {
    await CommercialProject.create({
      heroTitle: 'Zenith',
      heroSubtitle: 'Tower',
      heroDescription: 'A premium commercial destination redefining modern workspaces...',
      stats: [
        { value: '25', label: 'Stories' },
        { value: '500K', label: 'Sq. Ft.' },
        { value: '120', label: 'Offices' },
        { value: '400+', label: 'Parking' }
      ]
    });
    console.log('Seeded');
  } else {
    console.log('Already seeded');
  }
  process.exit(0);
});

