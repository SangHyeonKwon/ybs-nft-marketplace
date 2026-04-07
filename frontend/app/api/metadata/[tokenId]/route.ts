import { IPFS_GATEWAY, IPFS_METADATA_CID } from "@/lib/contract";

export const revalidate = 3600; // cache 1 hour

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ tokenId: string }> }
) {
  const { tokenId } = await params;
  const id = parseInt(tokenId, 10);

  if (isNaN(id) || id < 1 || id > 300) {
    return Response.json({ error: "Invalid tokenId" }, { status: 400 });
  }

  if (IPFS_METADATA_CID) {
    const ipfsUrl = `${IPFS_GATEWAY}${IPFS_METADATA_CID}/${id}.json`;
    const res = await fetch(ipfsUrl);
    if (res.ok) {
      const data = await res.json();
      return Response.json(data);
    }
  }

  // Fallback: serve from local metadata (dev mode)
  try {
    const fs = await import("fs");
    const path = await import("path");
    const metaPath = path.join(
      process.cwd(),
      "..",
      "nft_output",
      "metadata",
      `${id}.json`
    );
    const data = JSON.parse(fs.readFileSync(metaPath, "utf-8"));

    // Add gateway URL for image if it's a relative path
    if (data.image && !data.image.startsWith("http") && !data.image.startsWith("ipfs://")) {
      const { IPFS_IMAGES_CID } = await import("@/lib/contract");
      if (IPFS_IMAGES_CID) {
        data.image = `${IPFS_GATEWAY}${IPFS_IMAGES_CID}/${data.image}`;
      }
    }

    return Response.json(data);
  } catch {
    return Response.json({ error: "Metadata not found" }, { status: 404 });
  }
}
