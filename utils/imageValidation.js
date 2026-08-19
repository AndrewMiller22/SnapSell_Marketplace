const ALLOWED_IMAGE_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp", "gif"]);
const ALLOWED_VIDEO_EXTENSIONS = new Set(["mp4", "webm", "mov"]);
const MAX_MEDIA_COUNT = 8;
const MAX_IMAGE_COUNT = MAX_MEDIA_COUNT; // kept for any legacy callers
const MAX_IMAGE_BYTES = 3 * 1024 * 1024;
const MAX_VIDEO_BYTES = 10 * 1024 * 1024;

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

const validateVideoDataUrl = (item) => {
  const match = item.match(/^data:video\/(mp4|webm|quicktime|x-msvideo);base64,([A-Za-z0-9+/]+=*)$/i);
  if (!match) {
    return { valid: false, message: "Videos must be MP4, WebM, or MOV files" };
  }
  const buffer = Buffer.from(match[2], "base64");
  if (buffer.length === 0 || buffer.length > MAX_VIDEO_BYTES) {
    return { valid: false, message: "Each video must be 10 MB or smaller" };
  }
  return { valid: true };
};

const validateImages = (images = []) => {
  if (!Array.isArray(images)) {
    return { valid: false, message: "Media must be provided as a list" };
  }

  if (images.length > MAX_MEDIA_COUNT) {
    return { valid: false, message: `A listing can contain up to ${MAX_MEDIA_COUNT} photos or videos` };
  }

  for (const image of images) {
    if (typeof image !== "string" || image.length === 0) {
      return { valid: false, message: "Each media item must contain valid data" };
    }

    if (image.startsWith("data:video/")) {
      const result = validateVideoDataUrl(image);
      if (!result.valid) return result;
      continue;
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
  MAX_MEDIA_COUNT,
  MAX_IMAGE_COUNT,
  MAX_IMAGE_BYTES,
  MAX_VIDEO_BYTES,
  ALLOWED_VIDEO_EXTENSIONS,
  validateImages
};
