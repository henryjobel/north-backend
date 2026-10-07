import { HomeContent } from "../models/homeContentModel.js";
import { defaultHomeContent } from "../data/defaultHomeContent.js";

const merge = (base, value) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return base;
  return Object.fromEntries(Object.keys(base).map((key) => {
    const next = value[key];
    if (Array.isArray(base[key])) return [key, Array.isArray(next) ? next : base[key]];
    if (base[key] && typeof base[key] === "object") return [key, merge(base[key], next)];
    return [key, next ?? base[key]];
  }));
};

export const getHomeContent = async (_req, res) => {
  try {
    let document = await HomeContent.findOne();
    if (!document) document = await HomeContent.create({ content: defaultHomeContent });
    const content = merge(defaultHomeContent, document.content);
    res.status(200).json({ status: "success", data: { ...document.toObject(), content } });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

export const updateHomeContent = async (req, res) => {
  try {
    const content = merge(defaultHomeContent, req.body?.content || req.body);
    const document = await HomeContent.findOneAndUpdate(
      {},
      { content },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );
    res.status(200).json({ status: "success", data: document });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};
