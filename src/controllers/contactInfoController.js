import { ContactInfo } from "../models/contactInfoModel.js";

// Get contact info (singleton — always returns the first/only doc, creates default if none)
export const getContactInfo = async (req, res) => {
  try {
    let info = await ContactInfo.findOne();
    if (!info) {
      info = await ContactInfo.create({});
    }
    res.status(200).json({ status: "success", data: info });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

// Update contact info (upsert singleton)
export const updateContactInfo = async (req, res) => {
  try {
    let info = await ContactInfo.findOne();
    if (!info) {
      info = await ContactInfo.create(req.body);
    } else {
      Object.assign(info, req.body);
      await info.save();
    }
    res.status(200).json({ status: "success", data: info });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};
