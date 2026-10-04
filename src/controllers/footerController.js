import { Footer } from "../models/footerModel.js";

const cleanLinks = (items = []) => (Array.isArray(items) ? items : []).filter((item) => item?.label?.trim());
const cleanSocialLinks = (items = []) => (Array.isArray(items) ? items : []).filter((item) => item?.platform?.trim() && item?.url?.trim());

export const getFooter = async (_req, res) => {
  try {
    let footer = await Footer.findOne();
    if (!footer) footer = await Footer.create({});
    res.status(200).json({ status: "success", data: footer });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

export const updateFooter = async (req, res) => {
  try {
    const payload = {
      ...req.body,
      quickLinks: cleanLinks(req.body.quickLinks),
      socialLinks: cleanSocialLinks(req.body.socialLinks),
    };
    let footer = await Footer.findOne();
    if (!footer) footer = await Footer.create(payload);
    else {
      Object.assign(footer, payload);
      await footer.save();
    }
    res.status(200).json({ status: "success", data: footer });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};
