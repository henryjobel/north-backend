import { Concern, DeletedConcern } from "../models/concernModel.js";
import { defaultConcerns } from "../data/defaultConcerns.js";
import { MenuItem } from "../models/menuItemModel.js";

let seedPromise = null;

const seedDefaultConcerns = async () => {
  if (seedPromise) return seedPromise;

  seedPromise = (async () => {
    const deletedSlugs = await DeletedConcern.distinct("slug");
    const deletedSlugSet = new Set(deletedSlugs);

    await Promise.all(
      defaultConcerns
      .filter((concern) => !deletedSlugSet.has(concern.slug))
      .map((concern) =>
      Concern.updateOne(
        { slug: concern.slug },
        { $setOnInsert: concern },
        { upsert: true }
      )
    )
    );
  })().catch((err) => {
    seedPromise = null;
    throw err;
  });

  return seedPromise;
};

const sendConcern = (res, statusCode, data) => {
  const payload = typeof data?.toObject === "function" ? data.toObject() : data;
  res.status(statusCode).json({ status: "success", data: normalizeLtdText(payload) });
};

const skipLtdNormalizeKeys = new Set([
  "_id",
  "id",
  "slug",
  "routePath",
  "to",
  "href",
  "url",
  "image",
  "heroImage",
  "aboutImage",
  "galleryImages",
  "heroSliderImages",
  "createdAt",
  "updatedAt",
]);

const isPlainObject = (value) => {
  if (!value || typeof value !== "object") return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
};

const normalizeLtdText = (value, key = "") => {
  if (skipLtdNormalizeKeys.has(key)) return value;
  if (typeof value === "string") return value.replace(/\bltd\b/gi, "Ltd.");
  if (Array.isArray(value)) return value.map((entry) => normalizeLtdText(entry, key));
  if (isPlainObject(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([entryKey, entry]) => [entryKey, normalizeLtdText(entry, entryKey)])
    );
  }
  return value;
};

const slugify = (value = "") =>
  value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const normalizeRoutePath = (value = "") => {
  const routePath = String(value || "").trim();
  if (!routePath) return "";
  return routePath.startsWith("/") ? routePath : `/${routePath}`;
};

const normalizeConcernPayload = (payload) => {
  const next = { ...payload };
  if (next.slug) next.slug = slugify(next.slug);
  if (next.routePath) next.routePath = normalizeRoutePath(next.routePath);
  if (!next.routePath && next.slug) next.routePath = `/concern/${next.slug}`;
  return next;
};

export const getAllConcerns = async (_req, res) => {
  try {
    await seedDefaultConcerns();
    const concerns = await Concern.find().sort({ sortOrder: 1, createdAt: 1 }).lean();
    sendConcern(res, 200, concerns);
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

export const getConcernByIdOrSlug = async (req, res) => {
  try {
    await seedDefaultConcerns();
    const { idOrSlug } = req.params;
    const decodedParam = decodeURIComponent(String(idOrSlug || "").trim());
    const routePath = normalizeRoutePath(decodedParam);
    const query = decodedParam.match(/^[0-9a-fA-F]{24}$/)
      ? { _id: decodedParam }
      : {
          $or: [
            { slug: slugify(decodedParam) },
            { routePath: decodedParam },
            { routePath },
            { routePath: `/concern/${slugify(decodedParam)}` },
          ],
        };
    const concern = await Concern.findOne(query).lean();
    if (!concern) return res.status(404).json({ status: "fail", message: "Concern not found" });
    sendConcern(res, 200, concern);
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

export const createConcern = async (req, res) => {
  try {
    const payload = normalizeConcernPayload(req.body);
    if (payload.slug) {
      await DeletedConcern.deleteOne({ slug: payload.slug });
    }
    const concern = await Concern.create(payload);
    sendConcern(res, 201, concern);
  } catch (err) {
    res.status(400).json({ status: "fail", message: err.message });
  }
};

export const updateConcern = async (req, res) => {
  try {
    const payload = normalizeConcernPayload(req.body);
    if (payload.slug) {
      await DeletedConcern.deleteOne({ slug: payload.slug });
    }
    const concern = await Concern.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true,
    });
    if (!concern) return res.status(404).json({ status: "fail", message: "Concern not found" });
    sendConcern(res, 200, concern);
  } catch (err) {
    res.status(400).json({ status: "fail", message: err.message });
  }
};

export const reorderConcerns = async (req, res) => {
  try {
    const items = Array.isArray(req.body?.items)
      ? req.body.items
      : Array.isArray(req.body?.concerns)
        ? req.body.concerns
        : [];

    if (!items.length) {
      return res.status(400).json({ status: "fail", message: "Concern order list is required" });
    }

    const operations = items
      .map((item, index) => {
        const id = typeof item === "string" ? item : item?._id || item?.id;
        const sortOrder = Number(typeof item === "string" ? index + 1 : item?.sortOrder ?? index + 1);

        if (!id) return null;

        return {
          updateOne: {
            filter: { _id: id },
            update: { $set: { sortOrder: Number.isFinite(sortOrder) ? sortOrder : index + 1 } },
          },
        };
      })
      .filter(Boolean);

    if (!operations.length) {
      return res.status(400).json({ status: "fail", message: "Valid concern IDs are required" });
    }

    await Concern.bulkWrite(operations);
    const concerns = await Concern.find().sort({ sortOrder: 1, createdAt: 1 }).lean();
    sendConcern(res, 200, concerns);
  } catch (err) {
    res.status(400).json({ status: "fail", message: err.message });
  }
};

export const deleteConcern = async (req, res) => {
  try {
    const concern = await Concern.findByIdAndDelete(req.params.id);
    if (!concern) return res.status(404).json({ status: "fail", message: "Concern not found" });

    const routeCandidates = [
      concern.routePath,
      concern.slug ? `/concern/${concern.slug}` : "",
    ].filter(Boolean);
    const labelCandidates = [
      concern.title,
      normalizeLtdText(concern.title),
    ].filter(Boolean);

    if (defaultConcerns.some((item) => item.slug === concern.slug)) {
      await DeletedConcern.updateOne(
        { slug: concern.slug },
        {
          $set: {
            title: concern.title,
            routePath: concern.routePath,
            deletedAt: new Date(),
          },
        },
        { upsert: true }
      );
      seedPromise = null;
    }

    await Promise.all([
      MenuItem.deleteMany({
        $or: [
          { key: `concern-${concern._id}` },
          { source: "concern", to: { $in: routeCandidates } },
        ],
      }),
      MenuItem.updateMany(
        {
          source: "static",
          $or: [
            { to: { $in: routeCandidates } },
            { label: { $in: labelCandidates } },
          ],
        },
        { $set: { isVisible: false } }
      ),
    ]);

    res.status(204).json({ status: "success", data: null });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};
