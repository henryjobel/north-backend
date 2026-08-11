import fs from "fs";
import path from "path";
import { Review } from "../models/reviewModel.js";

// Create new Review
export const createReview = async (req, res) => {
  try { 
    const review = await Review.create(req.body);

    res.status(201).json({
      status: "success",
      data: review,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
};

// Get all review
export const getAllReview = async (req, res) => {
  try {
    const review = await Review.find();
    res.status(200).json({
      status: "success",
      results: review.length,
      data: review,
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

// Get single review by ID
export const getReviewById = async (req, res) => {
  try {
    const { id } = req.params;
    const review = await Review.findById(id);

    if (!review) {
      return res.status(404).json({ status: "fail", message: "review not found" });
    }

    res.status(200).json({ status: "success", data: review });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: err.message });
  }
};




// update review
export const updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { body } = req;

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({
        status: "error",
        message: "Review not found",
      });
    }

    const updateData = { ...body };
    const updatedReview = await Review.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      status: "success",
      data: updatedReview,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
};


// Delete review
export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review)
      return res
        .status(404)
        .json({ status: "fail", message: "review not found" });

    // finally delete DB data
    await Review.findByIdAndDelete(req.params.id);

    res.status(204).json({
      status: "success",
      message: "review and images deleted successfully",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
};




