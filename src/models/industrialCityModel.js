import mongoose from "mongoose";

const industrialCitySchema = new mongoose.Schema(
  {
    industrialCityVideo: { type: String, default: "" },

    heroEyebrow: { type: String, default: "" },
    heroTitle: { type: String, default: "" },
    locationEyebrow: { type: String, default: "" },
    locationTitle: { type: String, default: "" },
    featuresEyebrow: { type: String, default: "" },
    featuresTitle: { type: String, default: "" },
    plotsEyebrow: { type: String, default: "" },
    plotsTitle: { type: String, default: "" },
    plotIntroText: { type: String, default: "" },
    goalsEyebrow: { type: String, default: "" },
    goalsTitle: { type: String, default: "" },
    mapEyebrow: { type: String, default: "" },
    mapTitle: { type: String, default: "" },
    bookingEyebrow: { type: String, default: "" },
    bookingTitle: { type: String, default: "" },
    bookingSubtitle: { type: String, default: "" },

    overviewParagraph1: { type: String, default: "" },
    overviewParagraph2: { type: String, default: "" },

    specificationsParagraph1: { type: String, default: "" },
    specificationsParagraph2: { type: String, default: "" },
    specificationsParagraph3: { type: String, default: "" },

    locationBenefitsText: { type: String, default: "" },
    rulesRegulationText: { type: String, default: "" },
    goals: [{ type: String }],
    locationHighlights: [
      {
        title: { type: String, default: "" },
        detail: { type: String, default: "" },
        iconKey: { type: String, default: "" },
      },
    ],
    plotTabs: [
      {
        key: { type: String, default: "" },
        label: { type: String, default: "" },
        cards: [
          {
            title: { type: String, default: "" },
            description: { type: String, default: "" },
            iconKey: { type: String, default: "" },
          },
        ],
      },
    ],

    galleryImages: [
      {
        public_id: { type: String },
        url: { type: String },
      },
    ],

    brochureImage: {
      public_id: { type: String, default: "" },
      url: { type: String, default: "" },
    },

    brochurePdf: {
      public_id: { type: String, default: "" },
      url: { type: String, default: "" },
    },

    bookingPdf: {
      public_id: { type: String, default: "" },
      url: { type: String, default: "" },
    },

    mapImage: {
      public_id: { type: String, default: "" },
      url: { type: String, default: "" },
    },

    sectionImages: {
      heroImage: {
        public_id: { type: String, default: "" },
        url: { type: String, default: "" },
      },
      overviewImage: {
        public_id: { type: String, default: "" },
        url: { type: String, default: "" },
      },
      locationImage: {
        public_id: { type: String, default: "" },
        url: { type: String, default: "" },
      },
      featuresImage: {
        public_id: { type: String, default: "" },
        url: { type: String, default: "" },
      },
      plotsImage: {
        public_id: { type: String, default: "" },
        url: { type: String, default: "" },
      },
      goalsImage: {
        public_id: { type: String, default: "" },
        url: { type: String, default: "" },
      },
      partnersImage: {
        public_id: { type: String, default: "" },
        url: { type: String, default: "" },
      },
      bookingImage: {
        public_id: { type: String, default: "" },
        url: { type: String, default: "" },
      },
    },
  },
  { timestamps: true }
);

export const IndustrialCity = mongoose.model("IndustrialCity", industrialCitySchema);
