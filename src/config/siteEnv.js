import dotenv from 'dotenv';
dotenv.config();

const { PORT, MONGO_URI, JWT_SECRET, JWT_EXPIRES_IN, NODE_ENV, BACKEND_URL,
  CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET,
  CORS_ORIGINS, FRONTEND_URL } = process.env;

const requiredVariables = {
  MONGO_URI,
  JWT_SECRET,
  JWT_EXPIRES_IN,
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
};

const missingVariables = Object.entries(requiredVariables)
  .filter(([, value]) => !value)
  .map(([name]) => name);

if (NODE_ENV === 'production' && !CORS_ORIGINS && !FRONTEND_URL) {
  missingVariables.push('CORS_ORIGINS or FRONTEND_URL');
}

if (missingVariables.length > 0) {
  throw new Error(`Missing required environment variables: ${missingVariables.join(', ')}`);
}

export { PORT, MONGO_URI, JWT_SECRET, JWT_EXPIRES_IN, NODE_ENV, BACKEND_URL,
  CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET,
  CORS_ORIGINS, FRONTEND_URL };
