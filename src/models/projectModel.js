

import mongoose from "mongoose";

const descriptionSchema = new mongoose.Schema({
  generalFeature: { type: String, default: "" },
  elevator: { type: String, default: "" },
  bathroomFeature: { type: String, default: "" },
  kitchenDoor: { type: String },
  maidsToilet: { type: String },
});

const sectionImagesSchema = new mongoose.Schema(
  {
    generalFeature: { type: String },
    elevator: { type: String },
    bathroomFeature: { type: String },
    kitchenDoor: { type: String },
    maidsToilet: { type: String },
  },
  { _id: false }
);

const specsSchema = new mongoose.Schema({
  orientation: String,
  frontRoad: String,
  landSize: String,
  apartmentSize: String,
  apartments: String,
  parking: String,
  floors: String,
  handover: String,
  lifts: String,
  stairs: String,
  buildingType: String,
  address: String,
});

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    location: { type: String }, // map URL or string
    image: [{ type: String }], // array of images
    slideImage: [{ type: String }], // for slider
    galleryImages: [{ type: String }], // for visual tour photo gallery
    projectGalleryImages: [{ type: String }], // for public project gallery section
    mapLocation: [{ type: String }], // array of map images
    keyPhotos: {
    basement: String,
    groundFloor: String,
    typicalFloor: String,
    roofFloor: String,
  },
    status: { type: String, enum: ["Ready", "Ongoing", "Upcoming"], default: "Upcoming" },
    brochure: { type: String },
    description: descriptionSchema,
    sectionImages: sectionImagesSchema,
    specs: specsSchema,
  },
  { timestamps: true }
);

export const Project = mongoose.model("Project", projectSchema);
