import multer from "multer";

// Memory storage — files available as req.file.buffer / req.files
const memoryStorage = multer.memoryStorage();

const projectSectionImageFields = [
  { name: "heroImage", maxCount: 1 },
  { name: "overviewImage", maxCount: 1 },
  { name: "locationImage", maxCount: 1 },
  { name: "featuresImage", maxCount: 1 },
  { name: "plotsImage", maxCount: 1 },
  { name: "goalsImage", maxCount: 1 },
  { name: "partnersImage", maxCount: 1 },
  { name: "bookingImage", maxCount: 1 },
];

const cityGalleryImageMaxCount = 20;

const isPdfFile = (file) =>
  file.mimetype === "application/pdf" ||
  file.originalname?.toLowerCase().endsWith(".pdf");

const isImageFile = (file) => file.mimetype?.startsWith("image/");

const createFileFilter = (fileType) => (req, file, cb) => {
  if (["brochurePdf", "bookingPdf"].includes(file.fieldname)) {
    isPdfFile(file) ? cb(null, true) : cb(new Error("Only PDF allowed"), false);
    return;
  }

  if (fileType === "image+video") {
    const allowed = ["image/jpeg","image/png","image/webp","image/jpg","video/mp4","video/mpeg","video/webm"];
    allowed.includes(file.mimetype) ? cb(null, true) : cb(new Error("Only images and videos allowed"), false);
  } else if (fileType === "image+pdf") {
    if (file.fieldname === "brochure") {
      isPdfFile(file) ? cb(null, true) : cb(new Error("Only PDF allowed for brochure"), false);
    } else {
      isImageFile(file) ? cb(null, true) : cb(new Error("Only image files allowed"), false);
    }
  } else {
    isImageFile(file) ? cb(null, true) : cb(new Error("Only image files allowed"), false);
  }
};

export const createUploadMiddleware = ({ fieldName, fileType = "image", fileSizeLimit = 500 }) => {
  const multerInstance = multer({
    storage: memoryStorage,
    fileFilter: createFileFilter(fileType),
    limits: { fileSize: fileSizeLimit * 1024 * 1024 },
  });

  if (typeof fieldName === "string") return multerInstance.single(fieldName);
  if (Array.isArray(fieldName)) return multerInstance.fields(fieldName.map((name) => ({ name })));
  throw new Error("fieldName must be a string or an array");
};

export const uploadGreenCityVideoFiles = createUploadMiddleware({ fieldName: "greenCityVideo", fileType: "image+video" });
export const uploadIndustrialCityVideoFiles = createUploadMiddleware({ fieldName: "industrialCityVideo", fileType: "image+video" });

// Multi-field upload for SquareCity (video + gallery + brochure)
export const uploadSquareCityAllFiles = multer({
  storage: memoryStorage,
  fileFilter: createFileFilter("image+video"),
  limits: { fileSize: 100 * 1024 * 1024 },
}).fields([
  { name: "squareCityVideo", maxCount: 1 },
  { name: "galleryImages", maxCount: cityGalleryImageMaxCount },
  { name: "brochureImage", maxCount: 1 },
  { name: "brochurePdf", maxCount: 1 },
  { name: "bookingPdf", maxCount: 1 },
  { name: "mapImage", maxCount: 1 },
  ...projectSectionImageFields,
]);

// Multi-field upload for IndustrialCity (video + gallery + brochure)
export const uploadIndustrialCityAllFiles = multer({
  storage: memoryStorage,
  fileFilter: createFileFilter("image+video"),
  limits: { fileSize: 100 * 1024 * 1024 },
}).fields([
  { name: "industrialCityVideo", maxCount: 1 },
  { name: "galleryImages", maxCount: cityGalleryImageMaxCount },
  { name: "brochureImage", maxCount: 1 },
  { name: "brochurePdf", maxCount: 1 },
  { name: "bookingPdf", maxCount: 1 },
  { name: "mapImage", maxCount: 1 },
  ...projectSectionImageFields,
]);

// Multi-field upload for GreenCity (video + gallery + brochure)
export const uploadGreenCityAllFiles = multer({
  storage: memoryStorage,
  fileFilter: createFileFilter("image+video"),
  limits: { fileSize: 100 * 1024 * 1024 },
}).fields([
  { name: "greenCityVideo", maxCount: 1 },
  { name: "galleryImages", maxCount: cityGalleryImageMaxCount },
  { name: "brochureImage", maxCount: 1 },
  { name: "brochurePdf", maxCount: 1 },
  { name: "bookingPdf", maxCount: 1 },
  { name: "mapImage", maxCount: 1 },
  ...projectSectionImageFields,
]);
export const uploadsquareCityVideoFiles = createUploadMiddleware({ fieldName: "squareCityVideo", fileType: "image+video" });
export const uploadNewsEventFiles = createUploadMiddleware({ fieldName: ["image"], fileType: "image" });
export const uploadProjectFiles = createUploadMiddleware({ fieldName: ["image","slideImage","galleryImages","mapLocation","basement","groundFloor","typicalFloor","roofFloor","brochure"], fileType: "image+pdf" });
export const uploadProfilePic = createUploadMiddleware({ fieldName: "profilePic", fileType: "image" });
export const uploadPartners = createUploadMiddleware({ fieldName: "partnersImage", fileType: "image" });
export const parseFormData = multer().none();
