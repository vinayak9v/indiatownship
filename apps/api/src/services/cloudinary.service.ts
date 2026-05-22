import { v2 as cloudinary } from 'cloudinary';

// Lazy config — only active when env vars are set
function getCloudinary() {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME ?? '',
    api_key: process.env.CLOUDINARY_API_KEY ?? '',
    api_secret: process.env.CLOUDINARY_API_SECRET ?? '',
  });
  return cloudinary;
}

export async function uploadImage(
  fileBase64: string,
  folder = 'indiatownship/properties'
): Promise<{ url: string; publicId: string }> {
  const cl = getCloudinary();
  const result = await cl.uploader.upload(fileBase64, {
    folder,
    resource_type: 'image',
    transformation: [{ quality: 'auto', fetch_format: 'auto' }],
  });
  return { url: result.secure_url, publicId: result.public_id };
}

export async function uploadPdf(
  fileBase64: string
): Promise<{ url: string; publicId: string }> {
  const cl = getCloudinary();
  const result = await cl.uploader.upload(fileBase64, {
    folder: 'indiatownship/brochures',
    resource_type: 'raw',
  });
  return { url: result.secure_url, publicId: result.public_id };
}

export async function deleteAsset(publicId: string): Promise<void> {
  const cl = getCloudinary();
  await cl.uploader.destroy(publicId);
}
