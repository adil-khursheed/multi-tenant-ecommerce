import { BasePayload } from "payload";

export const createMediaDoc = async ({
  alt,
  base64String,
  payload,
  storeName,
  uploadedMediaId,
}: {
  payload: BasePayload;
  base64String: string;
  alt: string;
  uploadedMediaId: string | null;
  storeName: string;
}) => {
  const match = base64String.match(/^data:(image\/\w+);base64,(.+)$/);
  if (match) {
    const mimeType = match[1] as string;
    const base64Data = match[2] as string;
    const extension = mimeType.split("/")[1] || "png";
    const buffer = Buffer.from(base64Data, "base64");

    const mediaDoc = await payload.create({
      collection: "media",
      data: { alt: alt },
      file: {
        data: buffer,
        mimetype: mimeType,
        name: `${storeName?.split(" ").join("-")}-logo-${Date.now()}.${extension}`,
        size: buffer.length,
      },
    });
    uploadedMediaId = mediaDoc.id;
  }
  return uploadedMediaId;
};
