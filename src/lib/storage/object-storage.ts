import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "@/config/env";

let client: S3Client | null = null;

export function isObjectStorageConfigured(): boolean {
  return Boolean(
    env.OBJECT_STORAGE_ENABLED && env.S3_BUCKET && env.S3_ACCESS_KEY_ID && env.S3_SECRET_ACCESS_KEY,
  );
}

function getObjectStorageClient(): S3Client {
  if (!isObjectStorageConfigured()) throw new Error("Object storage is not configured");
  client ??= new S3Client({
    region: env.S3_REGION,
    endpoint: env.S3_ENDPOINT,
    forcePathStyle: env.S3_FORCE_PATH_STYLE,
    credentials: {
      accessKeyId: env.S3_ACCESS_KEY_ID!,
      secretAccessKey: env.S3_SECRET_ACCESS_KEY!,
    },
  });
  return client;
}

export async function putJsonObject(key: string, value: unknown): Promise<{ key: string }> {
  const body = JSON.stringify(value);
  await getObjectStorageClient().send(
    new PutObjectCommand({
      Bucket: env.S3_BUCKET,
      Key: key,
      Body: body,
      ContentType: "application/json; charset=utf-8",
      CacheControl: "private, max-age=0, no-store",
    }),
  );
  return { key };
}

export async function createReadUrl(key: string): Promise<string> {
  return getSignedUrl(
    getObjectStorageClient(),
    new GetObjectCommand({ Bucket: env.S3_BUCKET, Key: key }),
    { expiresIn: env.S3_SIGNED_URL_TTL_SECONDS },
  );
}

export async function deleteObject(key: string): Promise<void> {
  await getObjectStorageClient().send(new DeleteObjectCommand({ Bucket: env.S3_BUCKET, Key: key }));
}

export async function checkObjectStorageHealth() {
  return {
    configured: isObjectStorageConfigured(),
    bucket: env.S3_BUCKET ?? null,
    endpoint: env.S3_ENDPOINT ?? null,
  };
}
