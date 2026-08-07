import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';
import AppError from '../utils/AppError.js';

// Ensure upload directories exist
const uploadDir = path.join(process.cwd(), 'uploads', 'candidates');
const imagesDir = path.join(uploadDir, 'images');
const docsDir = path.join(uploadDir, 'documents');

if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}
if (!fs.existsSync(docsDir)) {
  fs.mkdirSync(docsDir, { recursive: true });
}

// Multer disk storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'profileImage' || file.fieldname === 'photoUrl') {
      cb(null, imagesDir);
    } else if (file.fieldname === 'manifestoDocument' || file.fieldname === 'manifestoFile') {
      cb(null, docsDir);
    } else {
      cb(null, uploadDir);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

// File type validator
const fileFilter = (req, file, cb) => {
  const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const allowedDocTypes = ['application/pdf'];

  if (file.fieldname === 'profileImage' || file.fieldname === 'photoUrl') {
    if (allowedImageTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new AppError('Invalid image file type. Only JPEG, JPG, PNG, and WEBP images are allowed.', 400, 'UploadError'), false);
    }
  } else if (file.fieldname === 'manifestoDocument' || file.fieldname === 'manifestoFile') {
    if (allowedDocTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new AppError('Invalid document file type. Only PDF documents are allowed.', 400, 'UploadError'), false);
    }
  } else {
    cb(new AppError(`Unexpected field '${file.fieldname}' for file upload.`, 400, 'UploadError'), false);
  }
};

// Configured Multer instance with 10MB max limit
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

/**
 * Middleware handling candidate profile image and manifesto document upload fields
 */
export const uploadCandidateFiles = (req, res, next) => {
  const uploadFields = upload.fields([
    { name: 'profileImage', maxCount: 1 },
    { name: 'photoUrl', maxCount: 1 },
    { name: 'manifestoDocument', maxCount: 1 },
    { name: 'manifestoFile', maxCount: 1 },
  ]);

  uploadFields(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return next(new AppError('File size exceeds the 10MB maximum limit.', 400, 'UploadError'));
        }
        return next(new AppError(`Upload error: ${err.message}`, 400, 'UploadError'));
      }
      return next(err);
    }

    // Attach relative paths to req.body if files were uploaded
    if (req.files) {
      if (req.files.profileImage?.[0]) {
        const file = req.files.profileImage[0];
        req.body.profileImage = `/uploads/candidates/images/${file.filename}`;
        req.body.photoUrl = req.body.profileImage;
      } else if (req.files.photoUrl?.[0]) {
        const file = req.files.photoUrl[0];
        req.body.profileImage = `/uploads/candidates/images/${file.filename}`;
        req.body.photoUrl = req.body.profileImage;
      }

      if (req.files.manifestoDocument?.[0]) {
        const file = req.files.manifestoDocument[0];
        req.body.manifestoDocument = `/uploads/candidates/documents/${file.filename}`;
      } else if (req.files.manifestoFile?.[0]) {
        const file = req.files.manifestoFile[0];
        req.body.manifestoDocument = `/uploads/candidates/documents/${file.filename}`;
      }
    }

    next();
  });
};

export default {
  uploadCandidateFiles,
};
