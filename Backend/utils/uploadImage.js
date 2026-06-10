const cloudinary = require('cloudinary').v2
async function uploadImage(imagePath) {
     try{
   
      const result = await cloudinary.uploader.upload(imagePath, {
        folder:"blog app",
    });

      return result
    }
    catch(err){
    }
}

async function deleteImage(imgId) {
     try{
   
      await cloudinary.uploader.destroy(imgId)

    }
    catch(err){
    }
}
module.exports = {uploadImage, deleteImage}