const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = require('./dotenv.config');

const cloudinary = require('cloudinary').v2
require('dotenv').config()
async function cloudinaryConfig(params) {
  await cloudinary.config({ 
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY, 
  api_secret: CLOUDINARY_API_SECRET
});

console.log('Cloudinary congifuration done')
}


module.exports = cloudinaryConfig