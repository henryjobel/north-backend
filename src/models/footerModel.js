import mongoose from "mongoose";

const linkSchema = new mongoose.Schema(
  {
    label: { type: String, trim: true, default: "" },
    to: { type: String, trim: true, default: "" },
    href: { type: String, trim: true, default: "" },
    external: { type: Boolean, default: false },
    isVisible: { type: Boolean, default: true },
  },
  { _id: false }
);

const socialSchema = new mongoose.Schema(
  {
    platform: { type: String, trim: true, default: "" },
    url: { type: String, trim: true, default: "" },
    isVisible: { type: Boolean, default: true },
  },
  { _id: false }
);

const footerSchema = new mongoose.Schema(
  {
    isVisible: { type: Boolean, default: true },
    logoUrl: { type: String, trim: true, default: "" },
    brandName: { type: String, default: "North South Group" },
    brandDescription: {
      type: String,
      default: "A pioneering housing & real estate company in Bangladesh, dedicated to transforming lives through exceptional living spaces since 2019.",
    },
    quickLinksTitle: { type: String, default: "Quick Links" },
    quickLinks: {
      type: [linkSchema],
      default: [
        { label: "Home", to: "/" },
        { label: "About Us", to: "/aboutUs" },
        { label: "Projects", to: "/projects" },
        { label: "Real Estate", to: "/realEstate" },
        { label: "Land Wanted", to: "/landWanted" },
        { label: "News & Events", to: "/newsEvent" },
        { label: "Career", to: "/career" },
        { label: "Privacy Policy", to: "/privacyPolicy" },
      ],
    },
    concernsTitle: { type: String, default: "Our Concern" },
    contactTitle: { type: String, default: "Contact Us" },
    showConcernLinks: { type: Boolean, default: true },
    showContact: { type: Boolean, default: true },
    showSocialLinks: { type: Boolean, default: true },
    socialLinks: {
      type: [socialSchema],
      default: [
        { platform: "Facebook", url: "https://www.facebook.com/northsouthgroupbd" },
        { platform: "X / Twitter", url: "https://x.com/nsgroupbd" },
        { platform: "LinkedIn", url: "https://www.linkedin.com/in/northsouthgroupbd/" },
        { platform: "Instagram", url: "https://www.instagram.com" },
        { platform: "YouTube", url: "https://www.youtube.com/channel/UCXFv3Z_4RYqThJIYSU8o85A" },
      ],
    },
    copyrightText: { type: String, default: "All Rights Reserved." },
    designedByLabel: { type: String, default: "Designed & Developed with ♥ by" },
    designedBy: { type: String, default: "NS Tech Team" },
    backgroundColor: { type: String, default: "#040811" },
    accentColor: { type: String, default: "#0f7771" },
  },
  { timestamps: true }
);

export const Footer = mongoose.model("Footer", footerSchema);
