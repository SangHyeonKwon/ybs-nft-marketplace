/**
 * Pinata IPFS Upload Script
 * Uploads 300 NFT images + metadata to IPFS via Pinata API
 *
 * Usage: node scripts/upload-to-pinata.mjs
 * Requires: PINATA_JWT in ../.env
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

// ── Load .env ──
const envPath = path.join(ROOT, ".env");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) process.env[match[1].trim()] = match[2].trim();
  }
}

const PINATA_JWT = process.env.PINATA_JWT;
if (!PINATA_JWT) {
  console.error("Error: PINATA_JWT not set in .env");
  process.exit(1);
}

const PINATA_API = "https://api.pinata.cloud";
const IMAGES_DIR = path.join(ROOT, "nft_output/images");
const METADATA_DIR = path.join(ROOT, "nft_output/metadata");
const METADATA_IPFS_DIR = path.join(ROOT, "nft_output/metadata_ipfs");

// ── Upload folder to Pinata ──
async function uploadFolder(folderPath, folderName) {
  const files = fs.readdirSync(folderPath).sort((a, b) => {
    const numA = parseInt(a) || 0;
    const numB = parseInt(b) || 0;
    return numA - numB;
  });

  console.log(`\nUploading ${files.length} files from ${folderName}...`);

  // Build multipart form data manually
  const boundary = "----PinataBoundary" + Date.now();
  const parts = [];

  // Add pinataMetadata
  parts.push(
    `--${boundary}\r\n` +
      `Content-Disposition: form-data; name="pinataMetadata"\r\n` +
      `Content-Type: application/json\r\n\r\n` +
      JSON.stringify({ name: folderName }) +
      `\r\n`
  );

  // Add pinataOptions for folder wrapping
  parts.push(
    `--${boundary}\r\n` +
      `Content-Disposition: form-data; name="pinataOptions"\r\n` +
      `Content-Type: application/json\r\n\r\n` +
      JSON.stringify({ wrapWithDirectory: true }) +
      `\r\n`
  );

  // Add each file
  const fileBuffers = [];
  for (let i = 0; i < files.length; i++) {
    const fileName = files[i];
    const filePath = path.join(folderPath, fileName);
    const fileData = fs.readFileSync(filePath);

    const header =
      `--${boundary}\r\n` +
      `Content-Disposition: form-data; name="file"; filename="${folderName}/${fileName}"\r\n` +
      `Content-Type: application/octet-stream\r\n\r\n`;

    fileBuffers.push(Buffer.from(header, "utf-8"));
    fileBuffers.push(fileData);
    fileBuffers.push(Buffer.from("\r\n", "utf-8"));

    if ((i + 1) % 50 === 0) {
      console.log(`  Prepared ${i + 1}/${files.length} files...`);
    }
  }

  // Closing boundary
  const closingBoundary = Buffer.from(`--${boundary}--\r\n`, "utf-8");

  // Combine all parts
  const textParts = Buffer.from(parts.join(""), "utf-8");
  const body = Buffer.concat([textParts, ...fileBuffers, closingBoundary]);

  console.log(
    `  Total upload size: ${(body.length / 1024 / 1024).toFixed(1)} MB`
  );
  console.log(`  Uploading to Pinata...`);

  const response = await fetch(`${PINATA_API}/pinning/pinFileToIPFS`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${PINATA_JWT}`,
      "Content-Type": `multipart/form-data; boundary=${boundary}`,
    },
    body,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Pinata upload failed (${response.status}): ${errorText}`);
  }

  const result = await response.json();
  console.log(`  ✓ Uploaded! CID: ${result.IpfsHash}`);
  return result.IpfsHash;
}

// ── Main ──
async function main() {
  console.log("=== Pinata IPFS Upload ===\n");

  // Step 1: Upload images folder
  console.log("Step 1: Uploading images...");
  const imageCID = await uploadFolder(IMAGES_DIR, "ybs-images");

  // Step 2: Update metadata with IPFS image URIs
  console.log("\nStep 2: Updating metadata with IPFS URIs...");
  if (fs.existsSync(METADATA_IPFS_DIR)) {
    fs.rmSync(METADATA_IPFS_DIR, { recursive: true });
  }
  fs.mkdirSync(METADATA_IPFS_DIR, { recursive: true });

  const metaFiles = fs.readdirSync(METADATA_DIR).filter((f) => f.endsWith(".json"));
  for (const file of metaFiles) {
    const data = JSON.parse(fs.readFileSync(path.join(METADATA_DIR, file), "utf-8"));
    data.image = `ipfs://${imageCID}/${data.image}`;
    fs.writeFileSync(
      path.join(METADATA_IPFS_DIR, file),
      JSON.stringify(data, null, 2)
    );
  }
  console.log(`  ✓ Updated ${metaFiles.length} metadata files`);

  // Step 3: Upload metadata folder
  console.log("\nStep 3: Uploading metadata...");
  const metadataCID = await uploadFolder(METADATA_IPFS_DIR, "ybs-metadata");

  // Summary
  console.log("\n=== Upload Complete ===");
  console.log(`Images CID:   ${imageCID}`);
  console.log(`Metadata CID: ${metadataCID}`);
  console.log(`\nImage URL example:`);
  console.log(`  ipfs://${imageCID}/1.png`);
  console.log(`  https://gateway.pinata.cloud/ipfs/${imageCID}/1.png`);
  console.log(`\nMetadata URL example:`);
  console.log(`  ipfs://${metadataCID}/1.json`);
  console.log(`  https://gateway.pinata.cloud/ipfs/${metadataCID}/1.json`);
  console.log(`\nAdd to frontend/.env.local:`);
  console.log(`  IPFS_IMAGES_CID=${imageCID}`);
  console.log(`  IPFS_METADATA_CID=${metadataCID}`);
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
