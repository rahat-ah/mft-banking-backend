export const getCloudinaryPublicId = (url) => {
  if (!url) return null;

  const parts = url.split("/");
  const filename = parts[parts.length - 1]; 
  const publicId = filename.split(".")[0]; 

  const folderIndex = parts.findIndex(p => p === "secure_uploads");
  if (folderIndex !== -1) {
    return `secure_uploads/${publicId}`;
  }

  return publicId;
};