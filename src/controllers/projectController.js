import { Project } from "../models/projectModel.js";
import mongoose from "mongoose";
import https from "https";
import http from "http";
import { uploadToCloudinary, deleteFromCloudinary, getPublicIdFromUrl, getResourceTypeFromUrl } from "../lib/cloudinaryService.js";
import cloudinary from "../lib/cloudinaryService.js";
import { CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, CLOUDINARY_CLOUD_NAME } from "../config/siteEnv.js";
import compressionService from "../lib/compression.js";

const sectionImageKeys = [
  "generalFeature",
  "elevator",
  "bathroomFeature",
  "kitchenDoor",
  "maidsToilet",
];

const keyPhotoKeys = ["basement", "groundFloor", "typicalFloor", "roofFloor"];

const hasOwn = (object, key) => Object.prototype.hasOwnProperty.call(object, key);

const slugify = (value = "") =>
  String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

// Returns a short-lived signed upload config for direct browser → Cloudinary uploads
export const getUploadSignature = (req, res) => {
  const timestamp = Math.round(Date.now() / 1000);
  const folder = req.query.folder || "projects";
  const signature = cloudinary.utils.api_sign_request({ timestamp, folder }, CLOUDINARY_API_SECRET);
  res.json({ signature, timestamp, cloudName: CLOUDINARY_CLOUD_NAME, apiKey: CLOUDINARY_API_KEY, folder });
};

// Proxy-download a project brochure so the browser gets a proper attachment response
export const downloadBrochure = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).select("brochure title");
    if (!project || !project.brochure) {
      return res.status(404).json({ status: "fail", message: "Brochure not found" });
    }

    const filename = `${(project.title || "Brochure").replace(/[^a-z0-9 _-]/gi, "_")}.pdf`;

    // Extract public_id from Cloudinary URL — raw files keep the .pdf extension
    let publicId = null;
    if (project.brochure.includes("cloudinary.com")) {
      try {
        const parts = project.brochure.split("/upload/");
        publicId = parts[1].replace(/^v\d+\//, "").replace(/\?.*$/, ""); // strip version + query
      } catch {
        publicId = null;
      }
    }

    if (!publicId) {
      return res.status(422).json({ status: "fail", message: "Invalid brochure URL" });
    }

    // private_download_url goes through Cloudinary's API with full credentials —
    // works even when raw delivery is restricted on the account
    const fetchUrl = cloudinary.utils.private_download_url(publicId, "", {
      resource_type: "raw",
      type: "upload",
    });

    const client = fetchUrl.startsWith("https") ? https : http;
    client.get(fetchUrl, (upstream) => {
      if (upstream.statusCode !== 200) {
        return res.status(upstream.statusCode || 502).json({ status: "error", message: "Could not fetch brochure from storage" });
      }
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      if (upstream.headers["content-length"]) {
        res.setHeader("Content-Length", upstream.headers["content-length"]);
      }
      upstream.pipe(res);
      upstream.on("error", () => res.status(502).end());
    }).on("error", () => res.status(502).json({ status: "error", message: "Failed to fetch brochure" }));
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

// Upload array of file buffers to Cloudinary, return URL array
const uploadFiles = async (filesArr, folder) => {
  return Promise.all(filesArr.map(async (f) => {
    const compressedBuffer = await compressionService.compress(f.buffer);
    const result = await uploadToCloudinary(compressedBuffer, folder);
    return result.url;
  }));
};

const uploadProjectBrochure = async (file) => {
  if (!file) return null;

  const options = file.mimetype === "application/pdf" ? { resource_type: "raw" } : {};
  let buffer = file.buffer;
  if (file.mimetype.startsWith("image/")) {
    buffer = await compressionService.compress(file.buffer);
  }
  const result = await uploadToCloudinary(buffer, "projects/brochures", options);
  return result.url;
};

export const createProject = async (req, res) => {
  try {
    const { body, files } = req;

    if (files) {
      const { image, slideImage, galleryImages, projectGalleryImages, mapLocation, basement, groundFloor, typicalFloor, roofFloor, brochure } = files;
      if (image?.length) body.image = await uploadFiles(image, "projects");
      if (slideImage?.length) body.slideImage = await uploadFiles(slideImage, "projects");
      if (galleryImages?.length) body.galleryImages = await uploadFiles(galleryImages, "projects/gallery");
      if (projectGalleryImages?.length) body.projectGalleryImages = await uploadFiles(projectGalleryImages, "projects/project-gallery");
      if (mapLocation?.length) body.mapLocation = await uploadFiles(mapLocation, "projects");
      if (brochure?.[0]) body.brochure = await uploadProjectBrochure(brochure[0]);
      body.keyPhotos = {
        basement: basement?.[0] ? (await (async () => { const compressed = await compressionService.compress(basement[0].buffer); return (await uploadToCloudinary(compressed, "projects")).url; })()) : null,
        groundFloor: groundFloor?.[0] ? (await (async () => { const compressed = await compressionService.compress(groundFloor[0].buffer); return (await uploadToCloudinary(compressed, "projects")).url; })()) : null,
        typicalFloor: typicalFloor?.[0] ? (await (async () => { const compressed = await compressionService.compress(typicalFloor[0].buffer); return (await uploadToCloudinary(compressed, "projects")).url; })()) : null,
        roofFloor: roofFloor?.[0] ? (await (async () => { const compressed = await compressionService.compress(roofFloor[0].buffer); return (await uploadToCloudinary(compressed, "projects")).url; })()) : null,
      };
    }

    if (typeof body.description === "string") body.description = JSON.parse(body.description);
    if (typeof body.sectionImages === "string") body.sectionImages = JSON.parse(body.sectionImages);
    if (typeof body.specs === "string") body.specs = JSON.parse(body.specs);

    const project = await Project.create(body);
    res.status(201).json({ status: "success", data: project });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: err.message });
  }
};

export const getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find();
    res.status(200).json({ status: "success", results: projects.length, data: projects });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

export const getProjectById = async (req, res) => {
  try {
    const idOrSlug = req.params.id;
    let project = null;

    if (mongoose.Types.ObjectId.isValid(idOrSlug)) {
      project = await Project.findById(idOrSlug);
    } else {
      const routeSlug = slugify(idOrSlug);
      const projects = await Project.find();
      project = projects.find((item) => slugify(item?.title) === routeSlug);
    }

    if (!project) return res.status(404).json({ status: "fail", message: "Project not found" });
    res.status(200).json({ status: "success", data: project });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

export const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ status: "fail", message: "Invalid project ID" });

    const { body, files } = req;
    const project = await Project.findById(id);
    if (!project) return res.status(404).json({ status: "fail", message: "Project not found" });

    const updateData = {
      title: body.title ?? project.title,
      location: body.location ?? project.location,
      status: body.status ?? project.status,
    };
    if (hasOwn(body, "description")) updateData.description = typeof body.description === "string" ? JSON.parse(body.description) : body.description;
    if (hasOwn(body, "sectionImages")) {
      const incomingSectionImages = typeof body.sectionImages === "string" ? JSON.parse(body.sectionImages) : body.sectionImages;
      updateData.sectionImages = { ...(project.sectionImages?.toObject?.() || project.sectionImages || {}) };

      sectionImageKeys.forEach((key) => {
        const previousUrl = project.sectionImages?.[key];
        const nextUrl = incomingSectionImages?.[key] ?? null;

        if (previousUrl && previousUrl !== nextUrl) {
          deleteFromCloudinary(getPublicIdFromUrl(previousUrl));
        }

        updateData.sectionImages[key] = nextUrl;
      });
    }
    if (hasOwn(body, "specs")) updateData.specs = typeof body.specs === "string" ? JSON.parse(body.specs) : body.specs;

    // Handle direct Cloudinary URLs sent as JSON from frontend (no file upload)
    if (hasOwn(body, "image")) updateData.image = body.image;
    if (hasOwn(body, "slideImage")) updateData.slideImage = body.slideImage;
    if (hasOwn(body, "galleryImages")) updateData.galleryImages = body.galleryImages;
    if (hasOwn(body, "projectGalleryImages")) updateData.projectGalleryImages = body.projectGalleryImages;
    if (hasOwn(body, "mapLocation")) updateData.mapLocation = body.mapLocation;
    if (hasOwn(body, "brochure")) updateData.brochure = body.brochure;
    if (hasOwn(body, "keyPhotos")) {
      const incomingKeyPhotos = typeof body.keyPhotos === "string" ? JSON.parse(body.keyPhotos) : body.keyPhotos;
      updateData.keyPhotos = { ...(project.keyPhotos?.toObject?.() || project.keyPhotos || {}) };

      keyPhotoKeys.forEach((key) => {
        const previousUrl = project.keyPhotos?.[key];
        const nextUrl = incomingKeyPhotos?.[key] ?? null;

        if (previousUrl && previousUrl !== nextUrl) {
          deleteFromCloudinary(getPublicIdFromUrl(previousUrl));
        }

        updateData.keyPhotos[key] = nextUrl;
      });
    }

    if (files) {
      if (files.image?.length) {
        project.image?.forEach((u) => deleteFromCloudinary(getPublicIdFromUrl(u)));
        updateData.image = await uploadFiles(files.image, "projects");
      }
      if (files.slideImage?.length) {
        project.slideImage?.forEach((u) => deleteFromCloudinary(getPublicIdFromUrl(u)));
        updateData.slideImage = await uploadFiles(files.slideImage, "projects");
      }
      if (files.galleryImages?.length) {
        project.galleryImages?.forEach((u) => deleteFromCloudinary(getPublicIdFromUrl(u)));
        updateData.galleryImages = await uploadFiles(files.galleryImages, "projects/gallery");
      }
      if (files.projectGalleryImages?.length) {
        project.projectGalleryImages?.forEach((u) => deleteFromCloudinary(getPublicIdFromUrl(u)));
        updateData.projectGalleryImages = await uploadFiles(files.projectGalleryImages, "projects/project-gallery");
      }
      if (files.mapLocation?.length) {
        project.mapLocation?.forEach((u) => deleteFromCloudinary(getPublicIdFromUrl(u)));
        updateData.mapLocation = await uploadFiles(files.mapLocation, "projects");
      }
      updateData.keyPhotos = { ...project.keyPhotos };
      if (files.basement?.[0]) { deleteFromCloudinary(getPublicIdFromUrl(project.keyPhotos?.basement)); const compressed = await compressionService.compress(files.basement[0].buffer); updateData.keyPhotos.basement = (await uploadToCloudinary(compressed, "projects")).url; }
      if (files.groundFloor?.[0]) { deleteFromCloudinary(getPublicIdFromUrl(project.keyPhotos?.groundFloor)); const compressed = await compressionService.compress(files.groundFloor[0].buffer); updateData.keyPhotos.groundFloor = (await uploadToCloudinary(compressed, "projects")).url; }
      if (files.typicalFloor?.[0]) { deleteFromCloudinary(getPublicIdFromUrl(project.keyPhotos?.typicalFloor)); const compressed = await compressionService.compress(files.typicalFloor[0].buffer); updateData.keyPhotos.typicalFloor = (await uploadToCloudinary(compressed, "projects")).url; }
      if (files.roofFloor?.[0]) { deleteFromCloudinary(getPublicIdFromUrl(project.keyPhotos?.roofFloor)); const compressed = await compressionService.compress(files.roofFloor[0].buffer); updateData.keyPhotos.roofFloor = (await uploadToCloudinary(compressed, "projects")).url; }
      if (files.brochure?.[0]) {
        deleteFromCloudinary(getPublicIdFromUrl(project.brochure), getResourceTypeFromUrl(project.brochure));
        updateData.brochure = await uploadProjectBrochure(files.brochure[0]);
      }
    }

    const updatedProject = await Project.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    res.status(200).json({ status: "success", data: updatedProject });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: err.message });
  }
};

export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ status: "fail", message: "Project not found" });

    [...(project.image || []), ...(project.slideImage || []), ...(project.galleryImages || []), ...(project.projectGalleryImages || []), ...(project.mapLocation || [])].forEach((u) => deleteFromCloudinary(getPublicIdFromUrl(u)));
    Object.values(project.keyPhotos || {}).forEach((u) => deleteFromCloudinary(getPublicIdFromUrl(u)));
    Object.values(project.sectionImages || {}).forEach((u) => deleteFromCloudinary(getPublicIdFromUrl(u)));
    deleteFromCloudinary(getPublicIdFromUrl(project.brochure), getResourceTypeFromUrl(project.brochure));

    await project.deleteOne();
    res.status(204).json({ status: "success", data: null });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};
