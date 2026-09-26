import multer from 'multer';

// Configure multer to use in-memory storage (buffers)
const storage = multer.memoryStorage();

// Create multer instance with 5MB max file size limit
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

export default upload;
