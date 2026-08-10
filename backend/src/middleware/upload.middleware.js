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

// Allowed extensions map
const ALLOWED_IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp']);
const ALLOWED_DOC_EXTENSIONS = new Set(['.pdf']);

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
    // Cryptographically safe random filename generation to prevent predictable path traversal
    const safePrefix = file.fieldname.replace(/[^a-zA-Z0-9]/g, '');
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${safePrefix}-${uniqueSuffix}${ext}`);
  },
});

// File type & security extension validator
const fileFilter = (req, file, cb) => {
  const allowedImageMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const allowedDocMimeTypes = ['application/pdf'];

  const originalName = file.originalname || '';
  const ext = path.extname(originalName).toLowerCase();

  // Reject path traversal attempts or embedded null bytes
  if (originalName.includes('\0') || originalName.includes('..') || originalName.includes('/') || originalName.includes('\\')) {
    return cb(new AppError('Malicious file name detected.', 400, 'UploadError'), false);
  }

  if (file.fieldname === 'profileImage' || file.fieldname === 'photoUrl') {
    if (allowedImageMimeTypes.includes(file.mimetype) && ALLOWED_IMAGE_EXTENSIONS.has(ext)) {
      cb(null, true);
    } else {
      cb(new AppError('Invalid image file. Only JPEG, JPG, PNG, and WEBP images with valid extensions are allowed.', 400, 'UploadError'), false);
    }
  } else if (file.fieldname === 'manifestoDocument' || file.fieldname === 'manifestoFile') {
    if (allowedDocMimeTypes.includes(file.mimetype) && ALLOWED_DOC_EXTENSIONS.has(ext)) {
      cb(null, true);
    } else {
      cb(new AppError('Invalid document file. Only PDF documents with valid extensions are allowed.', 400, 'UploadError'), false);
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
