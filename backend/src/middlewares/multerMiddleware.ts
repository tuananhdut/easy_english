import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { ApiError } from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'

const uploadDir = path.join(__dirname, '../../uploads')
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

// File size limits (in bytes)
const FILE_SIZE_LIMITS = {
  image: 5 * 1024 * 1024, // 5MB
  audio: 10 * 1024 * 1024 // 10MB
}

// Allowed file types
const ALLOWED_FILE_TYPES = {
  image: ['.jpg', '.jpeg', '.png', '.gif'],
  audio: ['.mp3', '.wav', '.ogg']
}

const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, uploadDir)
  },
  filename: function (_req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
    const ext = path.extname(file.originalname)
    cb(null, file.fieldname + '-' + uniqueSuffix + ext)
  }
})

const fileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const fileType = file.fieldname as keyof typeof ALLOWED_FILE_TYPES
  const ext = path.extname(file.originalname).toLowerCase()

  if (!ALLOWED_FILE_TYPES[fileType].includes(ext)) {
    cb(
      new ApiError(
        StatusCodes.BAD_REQUEST,
        `File type not allowed for ${fileType}. Allowed types: ${ALLOWED_FILE_TYPES[fileType].join(', ')}`
      )
    )
    return
  }

  cb(null, true)
}

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: FILE_SIZE_LIMITS.image // Default limit for all files
  }
})
