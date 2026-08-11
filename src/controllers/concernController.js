import { Concern } from "../models/concernModel.js";
import { defaultConcerns } from "../data/defaultConcerns.js";

let seedPromise = null;

const seedDefaultConcerns = async () => {
  if (seedPromise) return seedPromise;

  seedPromise = Promise.all(
    defaultConcerns.map((concern) =>
      Concern.updateOne(
        { slug: concern.slug },
        { $setOnInsert: concern },
        { upsert: true }
      )
    )
  ).catch((err) => {
    seedPromise = null;
    throw err;
  });

  return seedPromise;
};

const sendConcern = (res, statusCode, data) => {
  res.status(statusCode).json({ status: "success", data });
};

const slugify = (value = "") =>
  value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const normalizeConcernPayload = (payload) => {
  const next = { ...payload };
  if (next.slug) next.slug = slugify(next.slug);
  if (!next.routePath && next.slug) next.routePath = `/concern/${next.slug}`;
  return next;
};

export const getAllConcerns = async (_req, res) => {
  try {
    await seedDefaultConcerns();
    const concerns = await Concern.find().sort({ sortOrder: 1, createdAt: 1 });
    sendConcern(res, 200, concerns);
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

export const getConcernByIdOrSlug = async (req, res) => {
  try {
    await seedDefaultConcerns();
    const { idOrSlug } = req.params;
    const query = idOrSlug.match(/^[0-9a-fA-F]{24}$/) ? { _id: idOrSlug } : { slug: idOrSlug };
    const concern = await Concern.findOne(query);
    if (!concern) return res.status(404).json({ status: "fail", message: "Concern not found" });
    sendConcern(res, 200, concern);
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

export const createConcern = async (req, res) => {
  try {
    const concern = await Concern.create(normalizeConcernPayload(req.body));
    sendConcern(res, 201, concern);
  } catch (err) {
    res.status(400).json({ status: "fail", message: err.message });
  }
};

export const updateConcern = async (req, res) => {
  try {
    const concern = await Concern.findByIdAndUpdate(req.params.id, normalizeConcernPayload(req.body), {
      new: true,
      runValidators: true,
    });
    if (!concern) return res.status(404).json({ status: "fail", message: "Concern not found" });
    sendConcern(res, 200, concern);
  } catch (err) {
    res.status(400).json({ status: "fail", message: err.message });
  }
};

export const deleteConcern = async (req, res) => {
  try {
    const concern = await Concern.findByIdAndDelete(req.params.id);
    if (!concern) return res.status(404).json({ status: "fail", message: "Concern not found" });
    res.status(204).json({ status: "success", data: null });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};
