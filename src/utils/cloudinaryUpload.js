/**
 * Cloudinary Upload Utility
 * Handles file uploads to Cloudinary
 */

const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/upload`;

console.log('🔧 Cloudinary Config Loaded:', {
  cloudName: CLOUDINARY_CLOUD_NAME,
  uploadPreset: CLOUDINARY_UPLOAD_PRESET,
  uploadUrl: CLOUDINARY_UPLOAD_URL,
  allEnvVars: import.meta.env
});

if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
  console.warn('⚠️ Cloudinary configuration missing. Please set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET in .env file');
}

/**
 * Upload file to Cloudinary
 * @param {File} file - The file to upload
 * @param {Function} onProgress - Optional progress callback
 * @returns {Promise<Object>} Upload result with URL and public_id
 */
export const uploadToCloudinary = async (file, onProgress = null) => {
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
    throw new Error('Cloudinary configuration is missing. Please check your .env file.');
  }

  try {
    console.log('📤 Starting Cloudinary upload:', {
      fileName: file.name,
      fileSize: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
      fileType: file.type,
      cloudName: CLOUDINARY_CLOUD_NAME,
      uploadPreset: CLOUDINARY_UPLOAD_PRESET,
    });

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    
    // The preset already has folder and filename settings configured
    // No need to override them here

    const xhr = new XMLHttpRequest();

    return new Promise((resolve, reject) => {
      // Track upload progress
      if (onProgress) {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const percentComplete = Math.round((e.loaded / e.total) * 100);
            console.log(`📊 Upload progress: ${percentComplete}%`);
            onProgress(percentComplete);
          }
        });
      }

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          console.log('✅ Cloudinary upload successful:', {
            url: response.secure_url,
            publicId: response.public_id,
            format: response.format,
            size: `${(response.bytes / 1024 / 1024).toFixed(2)} MB`,
          });
          
          resolve({
            url: response.secure_url,
            publicId: response.public_id,
            format: response.format,
            resourceType: response.resource_type,
            width: response.width,
            height: response.height,
            bytes: response.bytes,
          });
        } else {
          const errorResponse = xhr.responseText ? JSON.parse(xhr.responseText) : {};
          console.error('❌ Cloudinary upload failed:', {
            status: xhr.status,
            statusText: xhr.statusText,
            responseText: xhr.responseText,
            error: errorResponse,
            uploadUrl: CLOUDINARY_UPLOAD_URL,
            preset: CLOUDINARY_UPLOAD_PRESET,
          });
          
          // Provide helpful error message
          let errorMessage = errorResponse.error?.message || `Upload failed with status ${xhr.status}`;
          if (xhr.status === 401) {
            errorMessage = `Upload preset "${CLOUDINARY_UPLOAD_PRESET}" is not configured as Unsigned. Please check your Cloudinary dashboard and ensure the preset is set to "Unsigned" mode.`;
          }
          
          reject(new Error(errorMessage));
        }
      });

      xhr.addEventListener('error', () => {
        console.error('❌ Network error during upload');
        reject(new Error('Network error during upload'));
      });

      xhr.addEventListener('abort', () => {
        console.warn('⚠️ Upload aborted');
        reject(new Error('Upload aborted'));
      });

      xhr.open('POST', CLOUDINARY_UPLOAD_URL);
      xhr.send(formData);
    });
  } catch (error) {
    console.error('❌ Cloudinary upload error:', error);
    throw error;
  }
};

/**
 * Get optimized Cloudinary URL with transformations
 * @param {string} publicId - Cloudinary public ID
 * @param {Object} options - Transformation options
 * @returns {string} Transformed URL
 */
export const getCloudinaryUrl = (publicId, options = {}) => {
  const {
    width = 'auto',
    quality = 'auto',
    format = 'auto',
    crop = 'scale',
  } = options;

  const transformations = `w_${width},q_${quality},f_${format},c_${crop}`;
  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${transformations}/${publicId}`;
};

/**
 * Validate file before upload
 * @param {File} file - File to validate
 * @param {Object} options - Validation options
 * @returns {Object} Validation result
 */
export const validateFile = (file, options = {}) => {
  const {
    maxSize = 10 * 1024 * 1024, // 10MB default
    allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'video/mp4', 'video/quicktime'],
  } = options;

  if (!file) {
    return { valid: false, error: 'No file provided' };
  }

  if (file.size > maxSize) {
    return { 
      valid: false, 
      error: `File size exceeds ${Math.round(maxSize / 1024 / 1024)}MB limit` 
    };
  }

  if (!allowedTypes.includes(file.type)) {
    return { 
      valid: false, 
      error: `File type ${file.type} is not allowed` 
    };
  }

  return { valid: true };
};
