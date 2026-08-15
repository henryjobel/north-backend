import { Concern } from "../models/concernModel.js";
import { MenuItem } from "../models/menuItemModel.js";

const defaultConcernMenuItems = [
  { key: "static-north-south-consortium-ltd", label: "North South Consortium Ltd", to: "/northSouthConsortiumLtd", sortOrder: 1 },
  { key: "static-northsouth-green-city-ltd", label: "Northsouth Green City Ltd", to: "/greenCity", sortOrder: 2 },
  { key: "static-northsouth-industrial-city", label: "Northsouth Industrial City", to: "/industrialCity", sortOrder: 3 },
  { key: "static-northsouth-square-city", label: "Northsouth Square City", to: "/squareCity", sortOrder: 4 },
  { key: "static-purbachal-nirapad-valley", label: "Purbachal Nirapad Valley", to: "/purbachalNirapadValley", sortOrder: 5 },
  { key: "static-northsouth-duplex-home", label: "Northsouth Duplex Home", to: "/conceptDetails", sortOrder: 6 },
  { key: "static-northsouth-farms-ltd", label: "Northsouth Farms Ltd", to: "/northsouthFarmsLtd", sortOrder: 7 },
  { key: "static-northsouth-garments", label: "Northsouth Garments", to: "/northsouthGarments", sortOrder: 8 },
  { key: "static-dailyadin", label: "Dailyadin", href: "https://www.dailyadin.com/", external: true, sortOrder: 9 },
  { key: "static-titanic-bay-hotel-resort-ltd", label: "Titanic Bay Hotel & Resort LTD", href: "https://www.titanicbay.com/", external: true, sortOrder: 10 },
];

let seedPromise = null;

const sortMenuItems = () => MenuItem.find().sort({ sortOrder: 1, createdAt: 1 }).lean();

const routeForConcern = (concern) => concern.routePath || (concern.slug ? `/concern/${concern.slug}` : "");

const seedMenuItems = async () => {
  if (seedPromise) return seedPromise;

  seedPromise = (async () => {
    await Promise.all(
      defaultConcernMenuItems.map((item) =>
        MenuItem.updateOne(
          { key: item.key },
          { $setOnInsert: { ...item, source: "static", isVisible: true } },
          { upsert: true }
        )
      )
    );

    const maxOrderItem = await MenuItem.findOne().sort({ sortOrder: -1 }).select("sortOrder").lean();
    let nextOrder = (maxOrderItem?.sortOrder || defaultConcernMenuItems.length) + 1;
    const concerns = await Concern.find({ isPublished: { $ne: false } }).sort({ sortOrder: 1, createdAt: 1 }).lean();

    await Promise.all(
      concerns.map((concern) => {
        const route = routeForConcern(concern);
        if (!route) return null;

        return MenuItem.updateOne(
          { key: `concern-${concern._id}` },
          {
            $setOnInsert: {
              key: `concern-${concern._id}`,
              label: concern.title,
              to: route,
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
