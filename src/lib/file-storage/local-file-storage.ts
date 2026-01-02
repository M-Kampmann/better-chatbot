import path from "node:path";
import fs from "node:fs/promises";
import { existsSync } from "node:fs";
import type {
  FileMetadata,
  FileStorage,
  UploadOptions,
  UploadUrl,
  UploadUrlOptions,
} from "./file-storage.interface";
import {
  resolveStoragePrefix,
  sanitizeFilename,
  toBuffer,
} from "./storage-utils";
import { FileNotFoundError } from "lib/errors";
import { generateUUID } from "lib/utils";
import logger from "logger";

const STORAGE_PREFIX = resolveStoragePrefix();

const buildKey = (filename: string) => {
  const safeName = sanitizeFilename(filename || "file");
  const id = generateUUID();
  const prefix = STORAGE_PREFIX ? `${STORAGE_PREFIX}/` : "";
  return path.posix.join(prefix, `${id}-${safeName}`);
};

const getStoragePath = () => {
  return process.env.UPLOAD_STORAGE_PATH || "./uploads";
};

const getPublicBaseUrl = () => {
  // Use the app's base URL for serving files
  return process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "";
};

export const createLocalFileStorage = (): FileStorage => {
  const storagePath = getStoragePath();
  const publicBaseUrl = getPublicBaseUrl();

  // Ensure storage directory exists
  const ensureStorageDir = async () => {
    if (!existsSync(storagePath)) {
      await fs.mkdir(storagePath, { recursive: true });
      logger.info(`Created storage directory: ${storagePath}`);
    }
  };

  const getFilePath = (key: string) => {
    return path.join(storagePath, key);
  };

  const getPublicUrl = (key: string) => {
    // Files are served via /api/storage/files/[...path] route
    return `${publicBaseUrl}/api/storage/files/${encodeURI(key)}`;
  };

  return {
    async upload(content, options: UploadOptions = {}) {
      await ensureStorageDir();

      const buffer = await toBuffer(content);
      const filename = options.filename ?? "file";
      const key = buildKey(filename);
      const filePath = getFilePath(key);

      // Ensure subdirectories exist
      const dir = path.dirname(filePath);
      if (!existsSync(dir)) {
        await fs.mkdir(dir, { recursive: true });
      }

      await fs.writeFile(filePath, buffer);

      const metadata: FileMetadata = {
        key,
        filename: path.basename(key),
        contentType: options.contentType || "application/octet-stream",
        size: buffer.byteLength,
        uploadedAt: new Date(),
      };

      const sourceUrl = getPublicUrl(key);

      logger.info(`File uploaded: ${key} (${buffer.byteLength} bytes)`);

      return { key, sourceUrl, metadata };
    },

    async createUploadUrl(
      _options: UploadUrlOptions,
    ): Promise<UploadUrl | null> {
      // Local filesystem doesn't support presigned URLs for client uploads
      // Clients should use the /api/storage/upload endpoint instead
      return null;
    },

    async download(key) {
      const filePath = getFilePath(key);
      try {
        const buffer = await fs.readFile(filePath);
        return buffer;
      } catch (error: unknown) {
        if ((error as NodeJS.ErrnoException).code === "ENOENT") {
          throw new FileNotFoundError(key, error);
        }
        throw error;
      }
    },

    async delete(key) {
      const filePath = getFilePath(key);
      try {
        await fs.unlink(filePath);
        logger.info(`File deleted: ${key}`);
      } catch (error: unknown) {
        if ((error as NodeJS.ErrnoException).code === "ENOENT") {
          // File doesn't exist, consider it deleted
          return;
        }
        throw error;
      }
    },

    async exists(key) {
      const filePath = getFilePath(key);
      try {
        await fs.access(filePath);
        return true;
      } catch {
        return false;
      }
    },

    async getMetadata(key) {
      const filePath = getFilePath(key);
      try {
        const stats = await fs.stat(filePath);

        // Try to determine content type from extension
        const ext = path.extname(key).toLowerCase();
        const contentTypeMap: Record<string, string> = {
          ".jpg": "image/jpeg",
          ".jpeg": "image/jpeg",
          ".png": "image/png",
          ".gif": "image/gif",
          ".webp": "image/webp",
          ".svg": "image/svg+xml",
          ".pdf": "application/pdf",
          ".txt": "text/plain",
          ".json": "application/json",
          ".xml": "application/xml",
          ".csv": "text/csv",
          ".md": "text/markdown",
          ".html": "text/html",
          ".css": "text/css",
          ".js": "application/javascript",
          ".zip": "application/zip",
        };

        return {
          key,
          filename: path.basename(key),
          contentType: contentTypeMap[ext] || "application/octet-stream",
          size: stats.size,
          uploadedAt: stats.mtime,
        } satisfies FileMetadata;
      } catch (error: unknown) {
        if ((error as NodeJS.ErrnoException).code === "ENOENT") {
          return null;
        }
        throw error;
      }
    },

    async getSourceUrl(key) {
      return getPublicUrl(key);
    },

    async getDownloadUrl(key) {
      // For local storage, download URL is the same as source URL
      return getPublicUrl(key);
    },
  } satisfies FileStorage;
};
