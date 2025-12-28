import { zip, type AsyncZippable } from "fflate";

export interface DownloadFile {
  path: string;
  url: string;
}

/**
 * Trigger a browser download for a blob
 */
function triggerDownload(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

/**
 * Downloads a single file with progress tracking
 */
export async function downloadSingleFile(
  url: string,
  name: string,
  onProgress?: (progress: number) => void
) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Download failed: ${response.statusText}`);

  const contentLength = response.headers.get("content-length");
  const total = contentLength ? parseInt(contentLength, 10) : 0;

  if (total === 0 || !response.body) {
    const blob = await response.blob();
    triggerDownload(blob, name);
    onProgress?.(100);
    return;
  }

  const reader = response.body.getReader();
  let receivedLength = 0;
  const chunks: Uint8Array[] = [];

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) {
      chunks.push(value);
      receivedLength += value.length;
      onProgress?.(Math.round((receivedLength / total) * 100));
    }
  }

  const blob = new Blob(chunks as BlobPart[]);
  triggerDownload(blob, name);
}

/**
 * Downloads multiple files as a ZIP archive with progress tracking
 */
export async function downloadBatchFiles(
  files: DownloadFile[],
  onProgress?: (progress: number) => void
) {
  const zippable: AsyncZippable = {};
  let completed = 0;

  await Promise.all(
    files.map(async (file) => {
      try {
        const response = await fetch(file.url);
        if (!response.ok) throw new Error(`Failed to fetch ${file.url}`);
        
        const buffer = await response.arrayBuffer();
        
        // Ensure extension is preserved if missing in path but present in URL
        let zipPath = file.path;
        const urlPath = file.url.split(/[?#]/)[0];
        const extMatch = urlPath.match(/\.[a-z0-9]+$/i);
        
        if (extMatch && !zipPath.toLowerCase().endsWith(extMatch[0].toLowerCase())) {
          zipPath += extMatch[0];
        }

        zippable[zipPath] = new Uint8Array(buffer);
        completed++;
        onProgress?.(Math.round((completed / files.length) * 90));
      } catch (err) {
        console.warn(`Skipping file ${file.path} due to error:`, err);
      }
    })
  );

  if (Object.keys(zippable).length === 0) {
    throw new Error("No files were successfully downloaded");
  }

  const content = await new Promise<Uint8Array>((resolve, reject) => {
    zip(zippable, (err, data) => {
      if (err) reject(err);
      else resolve(data);
    });
  });

  onProgress?.(100);
  const blob = new Blob([content as BlobPart], { type: "application/zip" });
  triggerDownload(blob, `batch-download-${Date.now()}.zip`);
}
