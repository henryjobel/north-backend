
import mongoose from "mongoose";
import { MONGO_URI } from "./src/config/siteEnv.js";
import { HomeSlider } from "./src/models/homeSliderModel.js";

const fallbackSlides = [
  {
    image: { public_id: "local_1", url: "/assets/Hotel.png" },
    eyebrow: "North South Group",
    title: "Redefining Modern Living",
    subtitle: "Residential, hospitality, and land development projects shaped around trust, location, and long-term value.",
    sortOrder: 1,
  },
  {
    image: { public_id: "local_2", url: "/assets/Land1.png" },
    eyebrow: "Land Development",
    title: "Invest For A Better Tomorrow",
    subtitle: "Planned communities and strategic land opportunities for buyers, investors, and landowners.",
    sortOrder: 2,
  },
  {
    image: { public_id: "local_3", url: "/assets/Land2.png" },
    eyebrow: "Trusted Partnership",
    title: "Build Your Sanctuary With Credibility",
    subtitle: "A practical route for landowners and families looking for reliable real estate development.",
    sortOrder: 3,
  },
  {
    image: { public_id: "local_4", url: "/assets/Apartment.jpg" },
    eyebrow: "Real Estate",
    title: "A New Standard Of Living",
    subtitle: "Homes and townships designed for comfort, connectivity, and everyday convenience.",
    sortOrder: 4,
  },
];

mongoose.connect(MONGO_URI).then(async () => {
  await HomeSlider.deleteMany({});
  await HomeSlider.insertMany(fallbackSlides);
  console.log("Seeded Home Slider");
  process.exit(0);
});

