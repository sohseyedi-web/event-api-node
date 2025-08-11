import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import fs from 'fs';
import createError from 'http-errors';
import { Request } from 'express';

interface MulterRequest extends Request {
  body: {
    fileUploadPath?: string;
    filename?: string;
    [key: string]: any;
  };
}

function createRoute(req: MulterRequest, fieldName: string): string {
  const date = new Date();
  const year = date.getFullYear().toString();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');

  const directory = path.join(__dirname, '..', 'uploads', fieldName, year, month, day);
  req.body.fileUploadPath = path.join('uploads', fieldName, year, month, day);

  fs.mkdirSync(directory, { recursive: true });
  return directory;
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file?.originalname) {
      const filePath = createRoute(req as MulterRequest, file.fieldname);
      return cb(null, filePath);
    }
    cb(new Error('Invalid file'), '');
  },
  filename: (req, file, cb) => {
    if (file.originalname) {
      const ext = path.extname(file.originalname);
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const fileName = `${uniqueSuffix}${ext}`;
      (req as MulterRequest).body.filename = fileName;
      return cb(null, fileName);
    }
    cb(new Error('Invalid file'), '');
  },
});

function fileFilter(req: Request, file: Express.Multer.File, cb: FileFilterCallback) {
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

  if (allowedExtensions.includes(ext)) {
    return cb(null, true);
  }
  return cb(createError.BadRequest('فرمت ارسال شده تصویر صحیح نمی‌باشد'));
}

const thumbnailMaxSize = 2 * 1000 * 1000; // 2MB

export const uploadFile = multer({
  storage,
  fileFilter,
  limits: { fileSize: thumbnailMaxSize },
});
