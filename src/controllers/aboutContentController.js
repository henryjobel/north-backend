import { AboutContent } from "../models/aboutContentModel.js";

const cleanStrings = (items = []) => items.map((item) => item?.trim?.() || "").filter(Boolean);

const normalizeCards = (items = []) =>
  items.filter(
    (item) => item?.title?.trim?.() || item?.text?.trim?.() || item?.img?.trim?.() || item?.name?.trim?.()
  );

const normalizePayload = (body = {}) => ({
  ...body,
  heroSlides: cleanStrings(body.heroSlides),
  overviewParagraphs: cleanStrings(body.overviewParagraphs),
  guidancePoints: cleanStrings(body.guidancePoints),
  stats: normalizeCards(body.stats),
  strengths: normalizeCards(body.strengths),
  leaders: normalizeCards(body.leaders),
  csrImages: normalizeCards(body.csrImages),
  officeImages: normalizeCards(body.officeImages),
  officeGalleryImages: normalizeCards(body.officeGalleryImages),
  mediaImages: normalizeCards(body.mediaImages),
  missionCards: normalizeCards(body.missionCards),
});

export const getAboutContent = async (_req, res) => {
  try {
    res.set({
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    });
    let content = await AboutContent.findOne();
    if (!content) {
      content = await AboutContent.create({});
    }
    res.status(200).json({ status: "success", data: content });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

export const updateAboutContent = async (req, res) => {
  try {
    const payload = normalizePayload(req.body);
    let content = await AboutContent.findOne();
    if (!content) {
      content = await AboutContent.create(payload);
    } else {
      Object.assign(content, payload);
      await content.save();
    }
    res.status(200).json({ status: "success", data: content });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};
