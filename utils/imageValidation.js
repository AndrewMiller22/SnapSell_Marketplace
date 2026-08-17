const ALLOWED_IMAGE_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp", "gif"]);
const MAX_IMAGE_COUNT = 3;
const MAX_IMAGE_BYTES = 3 * 1024 * 1024;

const hasExpectedSignature = (buffer, subtype) => {
  if (subtype === "jpeg" || subtype === "jpg") {
    return buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  }

  if (subtype === "png") {
    return buffer.length >= 8 && buffer.subarray(0, 8).equals(
      Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
    );
  }

  if (subtype === "gif") {
    const signature = buffer.subarray(0, 6).toString("ascii");
    return signature === "GIF87a" || signature === "GIF89a";
  }

  if (subtype === "webp") {
    return buffer.length >= 12 &&
      buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
      buffer.subarray(8, 12).toString("ascii") === "WEBP";
  }

  return false;
};

const validateDataUrl = (image) => {
  const match = image.match(/^data:image\/(jpeg|jpg|png|webp|gif);base64,([A-Za-z0-9+/]+={0,2})$/i);
  if (!match) {
    return { valid: false, message: "Photos must be JPG, JPEG, PNG, WEBP or GIF files" };
  }

  const subtype = match[1].toLowerCase();
  const buffer = Buffer.from(match[2], "base64");

  if (buffer.length === 0 || buffer.length > MAX_IMAGE_BYTES) {
    return { valid: false, message: "Each photo must be 3 MB or smaller" };
  }

  if (!hasExpectedSignature(buffer, subtype)) {
    return { valid: false, message: "A selected file does not contain a valid supported photo" };
  }

  return { valid: true };
};

const validateRemoteUrl = (image) => {
  try {
    const url = new URL(image);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return { valid: false };
    }

    const extension = url.pathname.split(".").pop()?.toLowerCase();
    return { valid: ALLOWED_IMAGE_EXTENSIONS.has(extension) };
  } catch {
    return { valid: false };
  }
};

const validateImages = (images = []) => {
  if (!Array.isArray(images)) {
    return { valid: false, message: "Images must be provided as a list" };
  }

  if (images.length > MAX_IMAGE_COUNT) {
    return { valid: false, message: `A listing can contain up to ${MAX_IMAGE_COUNT} photos` };
  }

  for (const image of images) {
    if (typeof image !== "string" || image.length === 0) {
      return { valid: false, message: "Each photo must contain valid image data" };
    }

    if (image.startsWith("data:")) {
      const result = validateDataUrl(image);
      if (!result.valid) return result;
      continue;
    }

    if (!validateRemoteUrl(image).valid) {
      return { valid: false, message: "Image links must point to a JPG, JPEG, PNG, WEBP or GIF file" };
    }
  }

  return { valid: true };
};

module.exports = {
  MAX_IMAGE_COUNT,
  MAX_IMAGE_BYTES,
  validateImages
};
