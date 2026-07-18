import multer from "multer";

const storage = multer.memoryStorage();

export const propertyMediaUpload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB — videos are bigger than images
}).fields([
  { name: "photos", maxCount: 10 },
  { name: "videos", maxCount: 3 },
]);

export const avatarUpload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
}).single("avatar");

export const reviewPhotoUpload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
}).array("photos", 5);

export const reportEvidenceUpload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 },
}).array("evidence", 5);
