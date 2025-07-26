const fs = require('fs');
const path = require('path');

/**
 * Handles image updates for single, fields, or array uploads.
 * Deletes old files and populates updateData accordingly.
 *
 * @param {Object} options
 * @param {Object} options.req - Express request (with req.file or req.files)
 * @param {Object} options.existingData - DB record containing old filenames
 * @param {string|string[]} options.fields - Field name(s) (e.g., 'profile_image' or ['cover_image', 'gallery'])
 * @param {Object} options.updateData - Object to hold new filenames for DB update
 * @param {string} options.mediaDir - Absolute path to image folder
 * @param {boolean} options.isArray - Whether this field is an array (e.g., gallery)
 */
function updateImage({ req, existingData, fields, updateData, mediaDir, isArray = false }) {
    
    const fieldList = Array.isArray(fields) ? fields : [fields];

    fieldList.forEach((fieldName) => {
        if (isArray && Array.isArray(req.files)) {
            // multer.array('images')
            const newFilenames = req.files.map(file => file.filename);

            // delete previous images (assuming existingData[fieldName] is an array)
            if (Array.isArray(existingData?.[fieldName])) {
                existingData[fieldName].forEach(oldFile => {
                    const oldFilePath = path.join(mediaDir, oldFile);
                    if (fs.existsSync(oldFilePath)) {
                        try {
                            fs.unlinkSync(oldFilePath);
                        } catch (err) {
                            console.error(`❌ Failed to delete file ${oldFilePath}:`, err);
                        }
                    }
                });
            }

            updateData[fieldName] = newFilenames;
        } else {
            // multer.single or multer.fields
            
            let newFile = null;

            if (req.file?.fieldname === fieldName) {
                newFile = req.file.filename;
            } else if (req.files?.[fieldName]?.[0]?.filename) {
                newFile = req.files[fieldName][0].filename;
            }

            if (newFile || updateData[fieldName] == '') {
                const oldFile = existingData?.[fieldName];
                const oldFilePath = oldFile ? path.join(mediaDir, oldFile) : null;

                if (oldFilePath && fs.existsSync(oldFilePath)) {
                    try {
                        fs.unlinkSync(oldFilePath);
                    } catch (err) {
                        console.error(`❌ Failed to delete ${fieldName}:`, err);
                    }
                }

                updateData[fieldName] = newFile;
            }
        }
    });
}

module.exports = updateImage;
