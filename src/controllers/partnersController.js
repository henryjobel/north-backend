import { Partners } from "../models/partnersModel.js";
import { uploadToCloudinary, deleteFromCloudinary, getPublicIdFromUrl } from "../lib/cloudinaryService.js";
import compressionService from "../lib/compression.js";

// Create new partners

export const createPartners = async (req, res) => {
  try {
    const { body, file } = req;

    if (file) {
      const compressedBuffer = await compressionService.compress(file.buffer);
      const result = await uploadToCloudinary(compressedBuffer, "partners");
      body.partnersImage = result.url;
    } else {
      delete body.partnersImage;
    }

    const partners = await Partners.create(body);

    res.status(201).json({
      status: "success",
      data: partners,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
};


// Get all partners
export const getAllPartners = async (req, res) => {
  try {
    const partners = await Partners.find();
    res.status(200).json({
      status: "success",
      results: partners.length,
      data: partners,
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

// Update partners by ID

// export const updatePartners = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { body, file } = req; // single file is in 'file'
//     const backendURL = `${req.protocol}://${req.get("host")}`;

//     const partners = await Partners.findById(id);
//     if (!partners) {
//       return res
//         .status(404)
//         .json({ status: "error", message: "Partners not found" });
//     }

//     const updateData = { ...body };

//     // Delete old image helper
//     const deleteFile = (fileUrl) => {
//       if (!fileUrl) return;
//       const filename = path.basename(fileUrl);
//       const filePath = path.join(
//         process.cwd(),
//         "uploads",
//         "partners",
//         filename
//       );
//       if (fs.existsSync(filePath)) {
//         fs.unlink(filePath, (err) => {
//           if (err) console.log("Failed to delete file:", err);
//         });
//       }
//     };

//     // If a new file is uploaded
//     if (file) {
//       // Delete old image
//       deleteFile(partners.partnersImage);

//       // Save new image URL
//       updateData.partnersImage = `${backendURL}/uploads/partners/${file.filename}`;
//     }



     


//     // Update DB
//     const updatedPartners = await Partners.findByIdAndUpdate(id, updateData, {
//       new: true,
//       runValidators: true,
//     });

//     res.status(200).json({ status: "success", data: updatedPartners });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ status: "error", message: err.message });
//   }
// };

export const updatePartners = async (req, res) => {
  try {
    const { id } = req.params;
    const { body, file } = req;
    const partners = await Partners.findById(id);
    if (!partners) {
      return res
        .status(404)
        .json({ status: "error", message: "Partners not found" });
    }

    const updateData = { ...body };

    if (file) {
      deleteFromCloudinary(getPublicIdFromUrl(partners.partnersImage));
      const compressedBuffer = await compressionService.compress(file.buffer);
      const result = await uploadToCloudinary(compressedBuffer, "partners");
      updateData.partnersImage = result.url;
    }

    // 🔹 Update DB
    const updatedPartners = await Partners.findByIdAndUpdate(
      id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      status: "success",
      data: updatedPartners,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
};


// Delete partners
export const deletePartners = async (req, res) => {
  try {
    const partners = await Partners.findById(req.params.id);

    if (!partners) {
      return res
        .status(404)
        .json({ status: "fail", message: "Partners not found" });
    }

    if (partners.partnersImage) deleteFromCloudinary(getPublicIdFromUrl(partners.partnersImage));
    await Partners.findByIdAndDelete(req.params.id);

    res.status(204).json({
      status: "success",
      message: "Partner deleted successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
};
