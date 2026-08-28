const maximumBytes = 10 * 1024 * 1024;
const maximumDimension = 6000;
const allowedTypes = new Set(["image/png", "image/jpeg", "image/webp", "image/gif"]);

export interface MediaInfo {
  mimeType: "image/png" | "image/jpeg" | "image/webp" | "image/gif";
  width: number;
  height: number;
}

function readUint32(view: DataView, offset: number): number {
  return view.getUint32(offset, false);
}

function imageInfo(bytes: Uint8Array, declaredType: string): MediaInfo {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let mimeType: MediaInfo["mimeType"];
  let width = 0;
  let height = 0;
  if (declaredType === "image/png" && bytes.length >= 24 && readUint32(view, 0) === 0x89504e47 && readUint32(view, 4) === 0x0d0a1a0a) {
    mimeType = "image/png";
    width = readUint32(view, 16);
    height = readUint32(view, 20);
  } else if (declaredType === "image/gif" && bytes.length >= 10 && new TextDecoder().decode(bytes.subarray(0, 6)) === "GIF89a" || declaredType === "image/gif" && bytes.length >= 10 && new TextDecoder().decode(bytes.subarray(0, 6)) === "GIF87a") {
    mimeType = "image/gif";
    width = view.getUint16(6, true);
    height = view.getUint16(8, true);
  } else if (declaredType === "image/webp" && bytes.length >= 30 && new TextDecoder().decode(bytes.subarray(0, 4)) === "RIFF" && new TextDecoder().decode(bytes.subarray(8, 12)) === "WEBP") {
    mimeType = "image/webp";
    const chunk = new TextDecoder().decode(bytes.subarray(12, 16));
    if (chunk === "VP8X" && bytes.length >= 30) {
      width = 1 + bytes[24] + (bytes[25] << 8) + (bytes[26] << 16);
      height = 1 + bytes[27] + (bytes[28] << 8) + (bytes[29] << 16);
    } else if (chunk === "VP8 " && bytes.length >= 30) {
      width = view.getUint16(26, true) & 0x3fff;
      height = view.getUint16(28, true) & 0x3fff;
    } else if (chunk === "VP8L" && bytes.length >= 25) {
      width = 1 + bytes[21] + ((bytes[22] & 0x3f) << 8);
      height = 1 + ((bytes[22] >> 6) | (bytes[23] << 2) | ((bytes[24] & 0x0f) << 10));
    }
  } else if (declaredType === "image/jpeg" && bytes.length >= 4 && bytes[0] === 0xff && bytes[1] === 0xd8) {
    mimeType = "image/jpeg";
    let offset = 2;
    while (offset + 9 < bytes.length) {
      if (bytes[offset] !== 0xff) { offset += 1; continue; }
      const marker = bytes[offset + 1];
      const length = view.getUint16(offset + 2, false);
      if (length < 2 || offset + length + 2 > bytes.length) break;
      if ((marker >= 0xc0 && marker <= 0xc3) || (marker >= 0xc5 && marker <= 0xc7) || (marker >= 0xc9 && marker <= 0xcb) || (marker >= 0xcd && marker <= 0xcf)) {
        height = view.getUint16(offset + 5, false);
        width = view.getUint16(offset + 7, false);
        break;
      }
      offset += length + 2;
    }
  } else {
    throw new Error("File content does not match a supported image format");
  }
  if (!width || !height || width > maximumDimension || height > maximumDimension) {
    throw new Error("Image dimensions must be between 1 and 6000 pixels");
  }
  return { mimeType, width, height };
}

export function validateUpload(file: File, bytes: Uint8Array): MediaInfo {
  if (!allowedTypes.has(file.type) || bytes.byteLength > maximumBytes) {
    throw new Error("Only PNG, JPEG, WebP, or GIF images up to 10 MB are supported");
  }
  return imageInfo(bytes, file.type);
}

export function mediaObjectKey(productId: string, mediaId: string, mimeType: string): string {
  const extension = mimeType === "image/jpeg" ? "jpg" : mimeType.slice("image/".length);
  return `marketing/products/${productId}/${mediaId}.${extension}`;
}
