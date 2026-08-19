import mongoose from "mongoose";

const statSchema = new mongoose.Schema(
  {
    value: { type: String, trim: true, default: "" },
    label: { type: String, trim: true, default: "" },
  },
  { _id: false }
);

const textCardSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true, default: "" },
    text: { type: String, trim: true, default: "" },
    iconKey: { type: String, trim: true, default: "" },
  },
  { _id: false }
);

const imageCardSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true, default: "" },
    img: { type: String, trim: true, default: "" },
  },
  { _id: false }
);

const leaderSchema = new mongoose.Schema(
  {
    id: { type: String, trim: true, default: "" },
    name: { type: String, trim: true, default: "" },
    role: { type: String, trim: true, default: "" },
    description: { type: String, trim: true, default: "" },
    img: { type: String, trim: true, default: "" },
  },
  { _id: false }
);

const aboutContentSchema = new mongoose.Schema(
  {
    heroEyebrow: { type: String, default: "About North South Group" },
    heroTitle: { type: String, default: "Building Planned Communities For Tomorrow" },
    heroSubtitle: {
      type: String,
      default:
        "North South Group is a pioneering real estate and housing company in Bangladesh, creating residential and industrial projects shaped around trust, growth, and sustainable living.",
    },
    heroSlides: { type: [String], default: [] },

    overviewEyebrow: { type: String, default: "Company Overview" },
    overviewTitle: {
      type: String,
      default: "A trusted name in real estate and urban development",
    },
    overviewText: {
      type: String,
      default:
        "Since our inception in 2019, we have worked to address housing and accommodation challenges around Dhaka through diverse residential and industrial projects.",
    },
    overviewBadge: { type: String, default: "Since 2019" },
    overviewHighlightEyebrow: { type: String, default: "North South Group" },
    overviewHighlightTitle: {
      type: String,
      default: "Planned projects shaped around trust and long-term value",
    },
    overviewParagraphs: { type: [String], default: [] },
    stats: { type: [statSchema], default: [] },
    strengths: { type: [textCardSchema], default: [] },

    guidanceEyebrow: { type: String, default: "What Guides Us" },
    guidanceTitle: {
      type: String,
      default: "Real estate with structure, care, and a practical vision",
    },
    guidancePoints: { type: [String], default: [] },

    videoEyebrow: { type: String, default: "Inside North South" },
    videoTitle: { type: String, default: "See the vision behind the group" },
    videoText: {
      type: String,
      default:
        "Watch a short presentation about the company, our project philosophy, and the communities we are working to build.",
    },
    videoUrl: { type: String, trim: true, default: "" },

    leadershipEyebrow: { type: String, default: "Leadership" },
    leadershipTitle: { type: String, default: "Board of Directors" },
    leadershipText: {
      type: String,
      default:
        "A focused leadership team guides the group with industry knowledge, operational discipline, and a client-first mindset.",
    },
    leaders: { type: [leaderSchema], default: [] },

    csrEyebrow: { type: String, default: "Corporate Social Responsibility" },
    csrTitle: { type: String, default: "Growing with the community" },
    csrText: {
      type: String,
      default:
        "North South believes in giving back to the community through initiatives that support development, wellbeing, and long-term national progress.",
    },
    csrImages: { type: [imageCardSchema], default: [] },

    missionCards: { type: [textCardSchema], default: [] },
  },
  { timestamps: true }
);

export const AboutContent = mongoose.model("AboutContent", aboutContentSchema);
