import { Contact } from "../models/contactModal.js";

// Create new contact
export const createContact = async (req, res) => {
  try {
    console.log("before", req.body);
    const contact = await Contact.create(req.body);
    console.log("after", contact);
    res.status(201).json({
      status: "success",
      data: contact,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
};

// Get all contact
export const getAllContact = async (req, res) => {
  try {
    const contact = await Contact.find();
    res.status(200).json({
      status: "success",
      results: contact.length,
      data: contact,
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

// Get single contact by ID
export const getContactById = async (req, res) => {
  try {
    const { id } = req.params;
    const contact = await Contact.findById(id);

    if (!contact) {
      return res
        .status(404)
        .json({ status: "fail", message: "contact not found" });
    }

    res.status(200).json({ status: "success", data: contact });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: err.message });
  }
};

// Update contact by ID
export const updateContact = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body; // get the updated fields from request

    const contact = await Contact.findByIdAndUpdate(id, updateData, {
      new: true, // return the updated document
      runValidators: true, // run schema validators
    });

    if (!contact) {
      return res.status(404).json({
        status: "error",
        message: "Contact not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: contact,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
};

// Delete contact
export const deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);
    if (!contact)
      return res
        .status(404)
        .json({ status: "fail", message: "contact City not found" });

    res.status(204).json({ status: "success", data: null });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};
