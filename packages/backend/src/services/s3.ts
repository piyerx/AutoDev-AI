import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";

const client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
});

const BUCKET = process.env.S3_BUCKET || "autodev-codebase-indexes";

export async function uploadCodeIndex(
  repoId: string,
  commitSha: string,
  files: { path: string; content: string }[]
) {
  const key = `${repoId}/${commitSha}/index.json`;
  await client.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: JSON.stringify(files),
      ContentType: "application/json",
    })
  );
  return key;
}

export async function getCodeIndex(
  repoId: string,
  commitSha: string
): Promise<{ path: string; content: string }[] | null> {
  const key = `${repoId}/${commitSha}/index.json`;
  try {
    const result = await client.send(
      new GetObjectCommand({ Bucket: BUCKET, Key: key })
    );
    const body = await result.Body?.transformToString();
    return body ? JSON.parse(body) : null;
  } catch {
    return null;
  }
}

/**
 * Get the latest code index for a repo (tries "latest" alias first).
 */
export async function getLatestCodeIndex(
  repoId: string
): Promise<{ path: string; content: string; size: number }[] | null> {
  const key = `${repoId}/latest/index.json`;
  try {
    const result = await client.send(
      new GetObjectCommand({ Bucket: BUCKET, Key: key })
    );
    const body = await result.Body?.transformToString();
    return body ? JSON.parse(body) : null;
  } catch {
    return null;
  }
}

/**
 * Upload a code index and also write a "latest" alias.
 */
export async function uploadCodeIndexWithLatest(
  repoId: string,
  commitSha: string,
  files: { path: string; content: string; size: number }[]
) {
  const body = JSON.stringify(files);
  const opts = { ContentType: "application/json" };

  // Write versioned copy
  await client.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: `${repoId}/${commitSha}/index.json`,
      Body: body,
      ...opts,
    })
  );

  // Write "latest" alias
  await client.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: `${repoId}/latest/index.json`,
      Body: body,
      ...opts,
    })
  );

  return `${repoId}/${commitSha}/index.json`;
}

export async function uploadAnalysisOutput(
  repoId: string,
  analysisType: string,
  content: unknown
) {
  const key = `${repoId}/analysis/${analysisType}.json`;
  await client.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: JSON.stringify(content),
      ContentType: "application/json",
    })
  );
  return key;
}

export async function getAnalysisOutput<T = unknown>(
  repoId: string,
  analysisType: string
): Promise<T | null> {
  const key = `${repoId}/analysis/${analysisType}.json`;
  try {
    const result = await client.send(
      new GetObjectCommand({ Bucket: BUCKET, Key: key })
    );
    const body = await result.Body?.transformToString();
    return body ? (JSON.parse(body) as T) : null;
  } catch {
    return null;
  }
}
