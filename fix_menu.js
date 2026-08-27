
import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import { MenuItem } from "./src/models/menuItemModel.js";

const MONGO_URI = process.env.MONGO_URI;
console.log("Connecting to:", MONGO_URI ? "***connected***" : "MISSING!");

mongoose.connect(MONGO_URI).then(async () => {
  console.log("BEFORE:");
  const before = await MenuItem.find().sort({ sortOrder: 1 }).select("key label sortOrder isVisible").lean();
  before.forEach(i => console.log(i.sortOrder, i.key, JSON.stringify(i.label), "visible:", i.isVisible));

  // Delete static-dailyadin (Daily Adin Press Media Ltd.)
  const result = await MenuItem.deleteOne({ key: "static-dailyadin" });
  console.log("\nDeleted static-dailyadin:", result.deletedCount);

  console.log("\nAFTER:");
  const after = await MenuItem.find().sort({ sortOrder: 1 }).select("key label sortOrder isVisible").lean();
  after.forEach(i => console.log(i.sortOrder, i.key, JSON.stringify(i.label), "visible:", i.isVisible));

  process.exit(0);
});

