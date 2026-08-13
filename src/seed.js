import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import { SquareCity } from "./models/squareCityModel.js";
import { IndustrialCity } from "./models/industrialCityModel.js";

const MONGO_URI = process.env.MONGO_URI;

// ── Static default content ─────────────────────────────────────────────────

const squareCityDefaults = {
  overviewParagraph1:
    "North South Group is a market leader in real estate, offering residential projects tailored to buyer needs with a commitment to quality and timely delivery.",
  overviewParagraph2:
    '"North South Square City" is a milestone project spanning 600 acres along the Dhaka-Sylhet Highway, developed in full compliance with RAJUK guidelines and modern urban planning standards.',
  specificationsParagraph1:
    "Eco-friendly layout prepared with RAJUK compliance and urban planning guidelines, ensuring a sustainable and livable environment for all residents.",
  specificationsParagraph2:
    "Space for civic infrastructure including parks, playgrounds, community centers, and a scenic 3 km lake with dedicated walkways for recreation.",
  specificationsParagraph3:
    "Dedicated zones for education, healthcare, shopping complexes, community centers, and mosques to meet every daily need within the township.",
  locationBenefitsText:
    "Purbachal Square City is easily accessible from all major routes in Dhaka. The project is located near the Purbachal Link Road and is well connected via Kuril Flyover and Kanchan Bridge, making daily commute convenient and efficient.",
  rulesRegulationText:
    "RAJUK exercises development control as per the East Bengal Building Construction Act, 1952 and its guidelines. All plots and constructions within North South Square City strictly follow RAJUK-approved layout plans and development regulations to ensure a planned and disciplined township.",
};

const industrialCityDefaults = {
  heroEyebrow: "BUILT FOR INDUSTRIAL PROGRESS",
  heroTitle: "North South Industrial City Project",
  locationEyebrow: "LOCATION OF NORTH SOUTH INDUSTRIAL CITY",
  locationTitle: "Prepared for logistics, production, and strong future connectivity",
  featuresEyebrow: "FUTURE READY INDUSTRIAL HUB",
  featuresTitle: "Features of North South Industrial City",
  plotsEyebrow: "CHOOSE PROPERTY BASED ON YOUR NEED",
  plotsTitle: "Available Plots",
  plotIntroText:
    "The master plan keeps residential, commercial, and support zones in balance so the project can grow in a more organized way.",
  goalsEyebrow: "A DESTINATION WORTH INVESTING IN",
  goalsTitle: "Goals of North South Industrial City",
  mapEyebrow: "EXPLORE THE FUTURE",
  mapTitle: "Industrial City Location Map",
  bookingEyebrow: "MASTER PLAN & BROCHURE",
  bookingTitle: "Review industrial blocks and request your preferred allocation",
  bookingSubtitle:
    "Download the project brochure for complete details.",
  overviewParagraph1:
    "North South Group is a market leader in the real estate building and land development sector, gaining strong confidence in housing and industrial development across Bangladesh.",
  overviewParagraph2:
    '"North South Industrial City" is another milestone project spanning 600 acres along the Dhaka-Sylhet Highway, designed specifically to meet the growing demand for industrial land and infrastructure in the region.',
  specificationsParagraph1:
    "Eco-friendly layout planning based on RAJUK rules and expert urban planning guidelines, ensuring an organized and future-ready industrial zone.",
  specificationsParagraph2:
    "Space allocated for civic infrastructure, parks, playgrounds, and a 3 km long lake with walkways, providing a balanced environment for workers and residents.",
  specificationsParagraph3:
    "Dedicated zones for education, healthcare, shopping, community centers, and mosques to support the daily needs of the industrial community.",
  locationBenefitsText:
    "Purbachal Industrial City is located on the eastern side of River Shitalakhya, opposite the Army Housing Jolshiri Abason Project-2. The project is easily accessible via Purbachal Link Road, Kuril Flyover, and Kanchan Bridge, ensuring excellent connectivity for industrial operations and logistics.",
  rulesRegulationText:
    "RAJUK exercises development control as per the East Bengal Building Construction Act, 1952 and its guidelines. All industrial plots and constructions within North South Industrial City follow RAJUK-approved layout plans and development regulations to ensure a planned industrial township.",
  goals: [
    "To create a planned industrial zone with organized long-term growth potential.",
    "To respond to rising demand for industrial land near Dhaka's expansion belt.",
    "To combine production space with essential worker and support infrastructure.",
    "To strengthen logistics convenience through strategic road connectivity.",
    "To keep industrial development disciplined through RAJUK-guided planning.",
  ],
  locationHighlights: [
    { title: "River Shitalakhya Side", detail: "Strategic edge that supports broader regional access", iconKey: "FaWater" },
    { title: "Jolshiri Abason Nearby", detail: "Positioned opposite a known and expanding development belt", iconKey: "FaMapMarkerAlt" },
    { title: "Purbachal Link Road", detail: "Fast and dependable movement toward the city", iconKey: "FaRoad" },
    { title: "Kanchan Bridge Access", detail: "Useful logistics connection for industrial transport routes", iconKey: "FaBusAlt" },
  ],
};

// ── Seed helper ────────────────────────────────────────────────────────────

async function seedModel(Model, defaults, label) {
  const records = await Model.find();

  if (records.length === 0) {
    // No records at all — create one with all defaults
    await Model.create(defaults);
    console.log(`✅  ${label}: No existing record found. Created new record with default content.`);
    return;
  }

  // Update each existing record: only fill in fields that are currently empty
  let updatedCount = 0;
  for (const record of records) {
    const patch = {};
    for (const [key, value] of Object.entries(defaults)) {
      const currentValue = record[key];
      const isEmptyString =
        typeof currentValue === "string" && currentValue.trim() === "";
      const isEmptyArray =
        Array.isArray(currentValue) && currentValue.length === 0;
      if (!currentValue || isEmptyString || isEmptyArray) {
        patch[key] = value;
      }
    }
    if (Object.keys(patch).length > 0) {
      await Model.findByIdAndUpdate(record._id, patch);
      updatedCount++;
      console.log(`✅  ${label} (id: ${record._id}): Filled ${Object.keys(patch).length} empty field(s): ${Object.keys(patch).join(", ")}`);
    } else {
      console.log(`ℹ️   ${label} (id: ${record._id}): All text fields already have content. Nothing changed.`);
    }
  }
}

// ── Main ───────────────────────────────────────────────────────────────────

async function main() {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(MONGO_URI, {
    serverSelectionTimeoutMS: 10000,
  });
  console.log("Connected!\n");

  await seedModel(SquareCity, squareCityDefaults, "SquareCity");
  await seedModel(IndustrialCity, industrialCityDefaults, "IndustrialCity");

  console.log("\nDone.");
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
