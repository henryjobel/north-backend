import { Concern, DeletedConcern } from "../models/concernModel.js";
import { MenuItem } from "../models/menuItemModel.js";

const defaultConcernMenuItems = [
  { key: "static-north-south-consortium-ltd", concernSlug: "north-south-consortium-ltd", label: "North South Consortium Ltd.", to: "/northSouthConsortiumLtd", sortOrder: 1 },
  { key: "static-northsouth-green-city-ltd", label: "Northsouth Green City Ltd.", to: "/greenCity", sortOrder: 2 },
  { key: "static-northsouth-industrial-city", label: "Northsouth Industrial City", to: "/industrialCity", sortOrder: 3 },
  { key: "static-northsouth-square-city", label: "Northsouth Square City", to: "/squareCity", sortOrder: 4 },
  { key: "static-purbachal-nirapad-valley", concernSlug: "purbachal-nirapad-valley", label: "Purbachal Nirapad Valley", to: "/purbachalNirapadValley", sortOrder: 5 },
  { key: "static-northsouth-duplex-home", concernSlug: "concept-details", label: "Northsouth Duplex Home", to: "/conceptDetails", sortOrder: 6 },
  { key: "static-northsouth-farms-ltd", concernSlug: "northsouth-farms-ltd", label: "Northsouth Farms Ltd.", to: "/northsouthFarmsLtd", sortOrder: 7 },
  { key: "static-northsouth-garments", concernSlug: "northsouth-garments", label: "Northsouth Garments", to: "/northsouthGarments", sortOrder: 8 },
  { key: "static-dailyadin", label: "Daily Adin Press Media Ltd.", href: "https://www.dailyadin.com/", external: true, sortOrder: 9 },
  { key: "static-titanic-bay-hotel-resort-ltd", label: "Titanic Bay Hotel & Resort Ltd.", href: "https://www.titanicbay.com/", external: true, sortOrder: 10 },
];

let seedPromise = null;

const sortMenuItems = () => MenuItem.find().sort({ sortOrder: 1, createdAt: 1 }).lean();

const routeForConcern = (concern) => concern.routePath || (concern.slug ? `/concern/${concern.slug}` : "");

const seedMenuItems = async () => {
  if (seedPromise) return seedPromise;

  seedPromise = (async () => {
    const deletedSlugs = await DeletedConcern.distinct("slug");
    const deletedSlugSet = new Set(deletedSlugs);
    const activeDefaultItems = defaultConcernMenuItems.filter(
      (item) => !item.concernSlug || !deletedSlugSet.has(item.concernSlug)
    );

    await MenuItem.updateMany(
      {
        key: {
          $in: defaultConcernMenuItems
            .filter((item) => item.concernSlug && deletedSlugSet.has(item.concernSlug))
            .map((item) => item.key),
        },
      },
      { $set: { isVisible: false } }
    );

    await Promise.all(
      activeDefaultItems.map((item) =>
        MenuItem.updateOne(
          { key: item.key },
          {
            $set: {
              label: item.label,
              to: item.to,
              href: item.href,
              external: item.external || false,
              source: "static",
            },
            $setOnInsert: { key: item.key, sortOrder: item.sortOrder, isVisible: true },
          },
          { upsert: true }
        )
      )
    );

    const concerns = await Concern.find({ isPublished: { $ne: false } }).sort({ sortOrder: 1, createdAt: 1 }).lean();
    const staticRoutes = new Set(activeDefaultItems.map((item) => item.to).filter(Boolean));
    const staticConcernSlugs = new Set(activeDefaultItems.map((item) => item.concernSlug).filter(Boolean));
    const dynamicConcerns = concerns.filter((concern) => {
      const route = routeForConcern(concern);
      return route && !staticRoutes.has(route) && !staticConcernSlugs.has(concern.slug);
    });
    const concernKeys = dynamicConcerns.map((concern) => `concern-${concern._id}`);

    await MenuItem.deleteMany({
      source: "concern",
      key: { $nin: concernKeys },
    });

    const maxOrderItem = await MenuItem.findOne().sort({ sortOrder: -1 }).select("sortOrder").lean();
    let nextOrder = (maxOrderItem?.sortOrder || defaultConcernMenuItems.length) + 1;

    await Promise.all(
      dynamicConcerns.map((concern) => {
        const route = routeForConcern(concern);

        return MenuItem.updateOne(
          { key: `concern-${concern._id}` },
          {
            $setOnInsert: {
              key: `concern-${concern._id}`,
              external: false,
              isVisible: true,
              sortOrder: nextOrder++,
              source: "concern",
            },
            $set: {
              label: concern.title,
              to: route,
            },
          },
          { upsert: true }
        );
      })
    );
  })()
    .catch((err) => {
      throw err;
    })
    .finally(() => {
      seedPromise = null;
    });

  return seedPromise;
};

const normalizeOrderItems = (items = []) =>
  items
    .map((item, index) => {
      const id = typeof item === "string" ? item : item?._id || item?.id;
      const sortOrder = Number(typeof item === "string" ? index + 1 : item?.sortOrder ?? index + 1);
      const isVisible = typeof item === "object" && Object.prototype.hasOwnProperty.call(item, "isVisible")
        ? Boolean(item.isVisible)
        : undefined;

      if (!id) return null;

      return {
        updateOne: {
          filter: { _id: id },
          update: {
            $set: {
              sortOrder: Number.isFinite(sortOrder) ? sortOrder : index + 1,
              ...(isVisible === undefined ? {} : { isVisible }),
            },
          },
        },
      };
    })
    .filter(Boolean);

export const getConcernMenuItems = async (_req, res) => {
  try {
    await seedMenuItems();
    const items = await sortMenuItems();
    res.status(200).json({ status: "success", data: items });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

export const reorderConcernMenuItems = async (req, res) => {
  try {
    await seedMenuItems();
    const items = Array.isArray(req.body?.items) ? req.body.items : [];
    const operations = normalizeOrderItems(items);

    if (!operations.length) {
      return res.status(400).json({ status: "fail", message: "Menu order list is required" });
    }

    await MenuItem.bulkWrite(operations);
    const menuItems = await sortMenuItems();
    res.status(200).json({ status: "success", data: menuItems });
  } catch (err) {
    res.status(400).json({ status: "fail", message: err.message });
  }
};
