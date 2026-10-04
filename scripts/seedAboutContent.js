import fs from "node:fs/promises";
import path from "node:path";
import mongoose from "mongoose";
import { MONGO_URI } from "../src/config/siteEnv.js";
import { uploadToCloudinary } from "../src/lib/cloudinaryService.js";
import { AboutContent } from "../src/models/aboutContentModel.js";

const assetRoot = path.resolve(process.cwd(), "../frontend/src/assets/images");
const uploadAsset = async (fileName, publicId, folder) => {
  const buffer = await fs.readFile(path.join(assetRoot, fileName));
  const result = await uploadToCloudinary(buffer, folder, { public_id: publicId, overwrite: true, invalidate: true });
  return result.url;
};
const isEmpty = (value) => value == null || (typeof value === "string" && !value.trim()) || (Array.isArray(value) && value.length === 0);

const staticText = {
  heroEyebrow: "About North South Group",
  heroTitle: "Building Planned Communities For Tomorrow",
  heroSubtitle: "North South Group is a pioneering real estate and housing company in Bangladesh, creating residential and industrial projects shaped around trust, growth, and sustainable living.",
  heroPrimaryButtonLabel: "Discover Our Story",
  heroSecondaryButtonLabel: "Management Team",
  concernsEyebrow: "Our Concerns",
  concernsLabel: "Sister Concerns",
  overviewEyebrow: "Company Overview",
  overviewTitle: "A trusted name in real estate and urban development",
  overviewText: "Since our inception in 2019, we have worked to address housing and accommodation challenges around Dhaka through diverse residential and industrial projects.",
  overviewBadge: "Since 2019",
  overviewHighlightEyebrow: "North South Group",
  overviewHighlightTitle: "Planned projects shaped around trust and long-term value",
  videoEyebrow: "Inside North South",
  videoTitle: "See the vision behind the group",
  videoText: "Watch a short presentation about the company, our project philosophy, and the communities we are working to build.",
  videoUrl: "https://youtu.be/kobE1ZGqrLc?si=OLsJlhP0MhKmJl62",
  mediaEyebrow: "Media & Publication",
  mediaTitle: "Daily Adin - newsroom, print journalism and circulation in one media ecosystem.",
  mediaText: "A closer look at Daily Adin's newsroom operations, front desk, print editions and real-world newspaper distribution.",
  mediaBadge: "Daily Adin - Media Wing",
  mediaStripEyebrow: "Print Presence",
  mediaStripTitle: "From publication to the reader.",
  mediaStripText: "Newspaper display, circulation and community reach captured through Daily Adin's print presence.",
  officeEyebrow: "Our Workspaces",
  officeTitle: "From project sites to management spaces, our work is built around coordination and service.",
  officeText: "Site Office, corporate office, meeting, and client service spaces.",
  leadershipEyebrow: "Leadership",
  leadershipTitle: "Board of Directors",
  leadershipText: "A focused leadership team guides the group with industry knowledge, operational discipline, and a client-first mindset.",
  csrEyebrow: "Corporate Social Responsibility",
  csrTitle: "Growing with the community",
  csrText: "North South believes in giving back to the community through initiatives that support development, wellbeing, and long-term national progress.",
  strengthsEyebrow: "Institutional Capabilities",
  strengthsTitle: "Core pillars behind the group.",
  strengthsText: "Disciplined planning, client confidence, sustainable thinking and long-term value guide every concern of the group.",
  missionEyebrow: "Purpose & Direction",
  missionTitle: "Built around a clear purpose.",
};
const overviewParagraphs = [
  "North South Group proudly operates through seven sister concerns and has established notable ventures including Purbachal North South Green City, North South Industrial City, Nirapad Valley Condominium Project, and North South Duplex Home.",
  "Beyond real estate, our group also operates North South Auto Rice Mill in Bogura and North South Agro Farm in Bhulta-Gausia, Rupganj, Narayanganj, supporting a broader vision of economic contribution and community progress.",
];
const stats = [
  { value: "2019", label: "Journey Started" }, { value: "7+", label: "Sister Concerns" },
  { value: "4", label: "Major Ventures" }, { value: "600+", label: "Acres Planned" },
];
const strengths = [
  { iconKey: "FaBuilding", title: "Planned Development", text: "Residential and industrial communities shaped around long-term value, access, and daily convenience." },
  { iconKey: "FaLeaf", title: "Sustainable Living", text: "Green spaces, civic facilities, and organized layouts guide our approach to healthier township growth." },
  { iconKey: "FaShieldAlt", title: "Reliable Governance", text: "Disciplined project planning and professional leadership keep delivery aligned with client confidence." },
  { iconKey: "FaHandshake", title: "Client Commitment", text: "We focus on trust, transparent communication, and real estate solutions that fit buyer needs." },
];
const missionCards = [
  { title: "Our Mission", text: "To provide quality and sustainable living accommodation to our valued clients." },
  { title: "Our Vision", text: "To be the leading and finest housing and real estate company in Bangladesh." },
  { title: "Our Promise", text: "To create planned communities with transparency, care, and long-term value." },
];
const officeImages = [
  { id: "site-office", title: "Site Office", subtitle: "Project operations, site coordination & client service", img: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1800&q=88", isPlaceholder: true },
  { id: "corporate-office", title: "Corporate Office", subtitle: "Management, planning & business operations", img: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1800&q=88", isPlaceholder: true },
  { id: "meeting-space", title: "Meeting & Planning", subtitle: "Presentation, collaboration & project review", img: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1800&q=88", isPlaceholder: true },
  { id: "client-lounge", title: "Client Experience", subtitle: "A welcoming environment for visitors & partners", img: "https://images.unsplash.com/photo-1497366412874-3415097a27e7?auto=format&fit=crop&w=1800&q=88", isPlaceholder: true },
];
const mediaImages = [
  { id: "daily-adin-news-desk", title: "Daily Adin News Desk", subtitle: "Editorial newsroom, reporting desk & digital news operations", img: "https://res.cloudinary.com/dpsjkcaa/image/upload/v1790327080/WhatsApp_Image_2026-09-24_at_5.50.27_PM_1.jpg", type: "office" },
  { id: "daily-adin-front-desk", title: "Daily Adin Front Desk", subtitle: "Reception, coordination & publication operations", img: "https://res.cloudinary.com/dpsjkcaa/image/upload/v1790327081/WhatsApp_Image_2026-09-24_at_5.50.27_PM.jpg", type: "office" },
  { id: "daily-adin-print-edition", title: "Daily Adin Print Edition", subtitle: "The Daily Adin alongside Bangladesh's daily newspaper circulation", img: "https://res.cloudinary.com/dpsjkcaa/image/upload/v1790327085/WhatsApp_Image_2026-09-24_at_5.55.00_PM.jpg", type: "paper" },
  { id: "daily-adin-newsstand", title: "Daily Adin At The Newsstand", subtitle: "Print presence at a local newspaper and magazine point", img: "https://res.cloudinary.com/dpsjkcaa/image/upload/v1790327081/WhatsApp_Image_2026-09-24_at_5.55.01_PM_1.jpg", type: "distribution" },
  { id: "daily-adin-reader-reach", title: "Daily Adin In The Community", subtitle: "Connecting print journalism with readers across the city", img: "https://res.cloudinary.com/dpsjkcaa/image/upload/v1790327083/WhatsApp_Image_2026-09-24_at_5.55.01_PM.jpg", type: "distribution" },
  { id: "daily-adin-paper-stack", title: "Print & Distribution", subtitle: "Daily newspapers prepared for retail circulation and readership", img: "https://res.cloudinary.com/dpsjkcaa/image/upload/v1790327084/WhatsApp_Image_2026-09-24_at_5.55.02_PM_1.jpg", type: "distribution" },
  { id: "daily-adin-retail-display", title: "Daily Print Presence", subtitle: "Daily Adin displayed among newspapers at a retail point", img: "https://res.cloudinary.com/dpsjkcaa/image/upload/v1790327085/WhatsApp_Image_2026-09-24_at_5.55.02_PM.jpg", type: "distribution" },
  { id: "daily-adin-print-spread", title: "Publication & Circulation", subtitle: "Print editions presented within Bangladesh's newspaper ecosystem", img: "https://res.cloudinary.com/dpsjkcaa/image/upload/v1790327082/WhatsApp_Image_2026-09-24_at_5.55.01_PM_2.jpg", type: "paper" },
];
const leaderDefaults = [
  { id: "chairman", name: "Md. Shaidul Islam Sazu", role: "Chairman", file: "ShaidulIsalmSazu.jpeg", description: "Provides strategic guidance for the group with a focus on governance, trust, and long-term institutional growth." },
  { id: "deputy-managing-director", name: "Md. Mahbubull Hossain Khan", role: "Deputy Managing Director", file: "MahbububullHossain.jpg", description: "Leads operational coordination and business development priorities across the group's projects and concerns." },
  { id: "managing-director", name: "Md. Usuf Ali", role: "Managing Director", file: "Usuf.jpg", description: "Guides the company vision with client-first decision making, project discipline, and sustainable growth planning." },
  { id: "hr-director", name: "Oumar Faruk", role: "Director, HR & Admin", file: "OUMARFARUKPhoto.jpg", description: "" },
  { id: "director", name: "Mst. Shajeratul Yiaken", role: "Director", file: "01.jpg", description: "" },
  { id: "ceo", name: "Brig. Gen. Md. Mahfuzur Rahman", role: "CEO", file: "CEOsir.jpg", description: "Chief Executive Officer of North South Group, providing strategic leadership and executive oversight across all group operations." },
  { id: "daily-adin-editor", name: "Khandoker Mojammel Hoque", role: "Executive Editor", file: "MojamelHok.jpg", description: "Executive Editor of North South Daily Adin Pressmedia Ltd., leading editorial operations, journalism standards and media outreach across Bangladesh." },
];

const run = async () => {
  await mongoose.connect(MONGO_URI);
  let content = await AboutContent.findOne();
  if (!content) content = new AboutContent();

  Object.entries(staticText).forEach(([key, value]) => { if (isEmpty(content[key])) content[key] = value; });
  if (isEmpty(content.overviewParagraphs)) content.overviewParagraphs = overviewParagraphs;
  if (isEmpty(content.stats)) content.stats = stats;
  if (isEmpty(content.strengths)) content.strengths = strengths;
  if (isEmpty(content.missionCards)) content.missionCards = missionCards;
  if (isEmpty(content.officeImages)) content.officeImages = officeImages;
  if (isEmpty(content.officeGalleryImages)) {
    content.officeGalleryImages = (content.officeImages || []).map((item) => item.toObject?.() || item);
  }
  if (isEmpty(content.mediaImages)) content.mediaImages = mediaImages;

  if (isEmpty(content.heroSlides)) {
    content.heroSlides = await Promise.all(["aboutBanner1.jpg", "aboutBanner2.jpg", "aboutBanner3.jpg"].map((file, index) => uploadAsset(file, `hero-${index + 1}`, "about/hero")));
  }
  if (isEmpty(content.csrImages)) {
    const titles = ["Green City", "Square City", "Industrial City", "Community Development", "Green Living", "Industrial Growth", "Urban Planning", "Future Infrastructure", "Connected Lifestyle", "Sustainable Spaces", "Planned Progress"];
    const urls = await Promise.all(titles.map((_, index) => uploadAsset(`aboutImg${index + 1}.jpg`, `csr-${index + 1}`, "about/csr")));
    content.csrImages = titles.map((title, index) => ({ id: `csr-${index + 1}`, title, img: urls[index] }));
  }

  const existingLeaders = Array.isArray(content.leaders) ? content.leaders.map((item) => item.toObject?.() || item) : [];
  content.leaders = await Promise.all(leaderDefaults.map(async (leader) => {
    const existing = existingLeaders.find((item) => String(item.role || "").toLowerCase() === leader.role.toLowerCase() || String(item.name || "").toLowerCase().includes(leader.name.split(" ").slice(-2).join(" ").toLowerCase()));
    const img = existing?.img || await uploadAsset(leader.file, leader.id, "about/leaders");
    return { id: leader.id, name: leader.name, role: leader.role, description: existing?.description || leader.description, img };
  }));

  await content.save();
  console.log(`About content seeded: ${content._id}`);
  console.log(`Hero slides: ${content.heroSlides.length}, leaders: ${content.leaders.length}, CSR images: ${content.csrImages.length}`);
  console.log(`Video URL: ${content.videoUrl}`);
};

run().catch((error) => { console.error(error); process.exitCode = 1; }).finally(async () => mongoose.disconnect());
