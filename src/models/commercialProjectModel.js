import mongoose from "mongoose";

const commercialProjectSchema = new mongoose.Schema(
  {
    // 1. Hero Section
    heroTitle: { type: String, default: "Zenith" },
    heroSubtitle: { type: String, default: "Tower" },
    heroDescription: { type: String, default: "A premium commercial destination redefining modern workspaces and retail experiences in the heart of the business district." },
    heroBadge: { type: String, default: "Commercial Development" },
    heroMarqueeText: { type: String, default: "Downtown BD — 25 Stories — Est. 2028 — Premium Commercial —" },
    heroImage: {
      public_id: { type: String, default: "" },
      url: { type: String, default: "" },
    },

    // 2. Stats Section
    stats: [
      {
        value: { type: String, default: "" },
        label: { type: String, default: "" },
      },
    ],

    // 3. Overview Section
    overviewTitle: { type: String, default: "A Landmark of Excellence" },
    overviewDescription: { type: String, default: "Situated in the heart of the business district, The Zenith Tower offers state-of-the-art commercial spaces designed for forward-thinking enterprises — setting a new standard for corporate environments." },
    overviewStatusBadge: { type: String, default: "Ongoing" },
    overviewStatusLabel: { type: String, default: "Construction Status" },
    overviewImage: {
      public_id: { type: String, default: "" },
      url: { type: String, default: "" },
    },

    // 4. Name/Signature Section
    signatureSubtitle: { type: String, default: "The Name" },
    signatureTitle: { type: String, default: "Why \"Zenith\"" },
    signatureDescription: { type: String, default: "The zenith is the sun's highest point in the sky — the peak of light, visibility, and reach. It's the vantage point this tower was built to command." },

    // 5. Highlights Section
    highlightsTitle: { type: String, default: "Unmatched Features" },
    highlightsSubtitle: { type: String, default: "Scroll to explore" },
    highlights: [
      {
        title: { type: String, default: "" },
        desc: { type: String, default: "" },
      },
    ],

    // 6. Architecture Showcase
    architectureTitle: { type: String, default: "Architectural Brilliance" },
    architectureDescription: { type: String, default: "The exterior boasts a dynamic geometric design that reflects the sky, creating a visually striking landmark — with triple-height lobby ceilings and premium finishes." },
    architectureImage1: {
      public_id: { type: String, default: "" },
      url: { type: String, default: "" },
    },
    workspaceTitle: { type: String, default: "Innovative Workspaces" },
    workspaceDescription: { type: String, default: "Column-free office floors built for productivity and well-being, with panoramic windows framing breathtaking views of the skyline." },
    architectureImage2: {
      public_id: { type: String, default: "" },
      url: { type: String, default: "" },
    },

    // 7. Gallery Section
    galleryTitle: { type: String, default: "Project Gallery" },
    galleryImages: [
      {
        title: { type: String, default: "" },
        public_id: { type: String, default: "" },
        url: { type: String, default: "" },
      },
    ],

    // 8. Video Section
    videoTitle: { type: String, default: "Experience The Zenith" },
    videoDescription: { type: String, default: "Watch our cinematic showcase to get a feel for the unparalleled luxury and scale of this development." },
    videoUrl: { type: String, default: "" },
    videoThumbnail: {
      public_id: { type: String, default: "" },
      url: { type: String, default: "" },
    },

    // 9. Specifications Section
    specsTitle: { type: String, default: "Specifications" },
    specs: [
      {
        label: { type: String, default: "" },
        value: { type: String, default: "" },
      },
    ],

    // 10. Location Section
    locationTitle: { type: String, default: "Prime Location" },
    locationDescription: { type: String, default: "Centrally located in the premier business district, offering unparalleled convenience for businesses, employees, and clients alike." },
    locationBenefits: [{ type: String }],
    mapImage: {
      public_id: { type: String, default: "" },
      url: { type: String, default: "" },
    },
    
    // 11. Final CTA
    ctaTitle: { type: String, default: "Claim Your Space Today" },
    ctaDescription: { type: String, default: "Contact our sales team for detailed floor plans, pricing, and availability." },
  },
  { timestamps: true }
);

export const CommercialProject = mongoose.model("CommercialProject", commercialProjectSchema);

