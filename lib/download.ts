import JSZip from "jszip";

export interface DownloadFile {
  path: string;
  url: string;
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
  if (!response.ok) throw new Error("Download failed");

  const contentLength = response.headers.get("content-length");
  const total = contentLength ? parseInt(contentLength, 10) : 0;

  if (total === 0) {
    // Fallback if no content-length
    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = name;
    link.click();
    window.URL.revokeObjectURL(downloadUrl);
  } else {
    const reader = response.body?.getReader();
    if (!reader) throw new Error("Failed to get reader");

    let receivedLength = 0;
    const chunks = [];

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      receivedLength += value.length;
      onProgress?.(Math.round((receivedLength / total) * 100));
    }

    const blob = new Blob(chunks);
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = name;
    link.click();
    window.URL.revokeObjectURL(downloadUrl);
  }
}

/**
 * Downloads multiple files as a ZIP archive with progress tracking
 */
export async function downloadBatchFiles(
  files: DownloadFile[],
  onProgress?: (progress: number) => void
) {
  const zip = new JSZip();
  let completed = 0;

  await Promise.all(
    files.map(async (file) => {
      const response = await fetch(file.url);
      if (!response.ok) throw new Error(`Failed to fetch ${file.path}`);
      const blob = await response.blob();

      // Ensure extension is preserved in the ZIP
      let zipPath = file.path;
      const urlPath = file.url.split("?")[0].split("#")[0];
      const lastDotIndex = urlPath.lastIndexOf(".");
      if (lastDotIndex !== -1) {
        const ext = urlPath.slice(lastDotIndex);
        if (ext.includes("/") || ext.length > 6) {
          // Not a valid extension
        } else if (!zipPath.toLowerCase().endsWith(ext.toLowerCase())) {
          zipPath += ext;
        }
      }

      zip.file(zipPath, blob);
      completed++;
      onProgress?.(Math.round((completed / files.length) * 90));
    })
  );

  const content = await zip.generateAsync({ type: "blob" }, (metadata) => {
    onProgress?.(90 + Math.round(metadata.percent * 0.1));
  });

  const url = URL.createObjectURL(content);
  const link = document.createElement("a");
  link.href = url;
  link.download = `download-${new Date().getTime()}.zip`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
