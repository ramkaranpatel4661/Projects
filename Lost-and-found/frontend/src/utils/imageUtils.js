// Image utility functions
export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;

  const baseUrl = import.meta.env.VITE_BASE_URL || 'http://localhost:5000';

  // Ensure path always includes /uploads
  const normalized = imagePath.startsWith('/uploads')
    ? imagePath
    : imagePath.startsWith('/')
      ? `/uploads${imagePath}`
      : `/uploads/${imagePath}`;

  return `${baseUrl}${normalized}`;
};

export const getImageUrls = (imageUrls) => {
  if (!imageUrls || !Array.isArray(imageUrls)) return [];

  return imageUrls.map(url => getImageUrl(url));
};

// Validate image file
export const validateImageFile = (file) => {
  const allowedTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp'
  ];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!allowedTypes.includes(file.type)) {
    throw new Error('Invalid file type. Please upload JPEG, PNG, GIF, or WebP images.');
  }

  if (file.size > maxSize) {
    throw new Error('File size too large. Please upload images smaller than 5MB.');
  }

  return true;
};

// Create image preview URL
export const createImagePreview = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};
