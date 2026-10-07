import React, { useEffect, useRef, useState, useMemo } from "react";
import { createPortal } from "react-dom";
import {
  UploadCloud,
  File,
  X,
  FileText,
  Image,
  Presentation,
  Eye,
  Download,
  FileArchive,
  Music,
  Video,
  Code,
  FileSpreadsheet,
  ExternalLink,
  Folder,
} from "lucide-react";
import { marked } from "marked";

const MAX_FILE_SIZE = 5 * 1024 * 1024 * 1024;

/* ==========================================
   MARKDOWN PREVIEW COMPONENT
========================================== */

const MarkdownPreview = ({ content }) => (
  <div
    className="prose max-w-none text-sm"
    dangerouslySetInnerHTML={{ __html: marked.parse(content || "") }}
  />
);

/* ==========================================
   MAIN COMPONENT
========================================== */

const ZipFileUpload = ({ files, onFilesChange, disabled = false }) => {
  const fileInputRef = useRef(null);
  const folderInputRef = useRef(null);

  const [isDragging, setIsDragging] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [textPreview, setTextPreview] = useState("");
  const [textLoading, setTextLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  // New state for async previews
  const [docxHtml, setDocxHtml] = useState("");
  const [docxLoading, setDocxLoading] = useState(false);

  const [sheetHtml, setSheetHtml] = useState("");
  const [sheetLoading, setSheetLoading] = useState(false);

  const [zipEntries, setZipEntries] = useState([]);
  const [zipLoading, setZipLoading] = useState(false);

  /* ==========================================
     FORMAT FILE SIZE
  ========================================== */

  const formatFileSize = (bytes) => {
    if (bytes === 0) {
      return "0 Bytes";
    }

    const units = ["Bytes", "KB", "MB", "GB"];

    const index = Math.floor(Math.log(bytes) / Math.log(1024));

    const size = bytes / Math.pow(1024, index);

    return size.toFixed(index === 0 ? 0 : 1) + " " + units[index];
  };

  /* ==========================================
     FILE EXTENSION
  ========================================== */

  const getFileExtension = (file) => {
    return file?.name?.split(".").pop()?.toLowerCase() || "";
  };

  /* ==========================================
     FILE ICON
  ========================================== */

  const getFileIcon = (file) => {
    const extension = getFileExtension(file);

    if (["ppt", "pptx"].includes(extension)) {
      return <Presentation size={18} className="text-[#d14b9a]" />;
    }

    if (
      ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp", "ico"].includes(
        extension,
      )
    ) {
      return <Image size={18} className="text-[#3f7fc4]" />;
    }

    if (["doc", "docx", "txt", "rtf"].includes(extension)) {
      return <FileText size={18} className="text-[#3f7fc4]" />;
    }

    if (["xls", "xlsx", "csv"].includes(extension)) {
      return <FileSpreadsheet size={18} className="text-[#2e7d32]" />;
    }

    if (["zip", "rar", "7z", "tar", "gz"].includes(extension)) {
      return <FileArchive size={18} className="text-[#f47a32]" />;
    }

    if (file?.type?.startsWith("video/")) {
      return <Video size={18} className="text-[#7b61c9]" />;
    }

    if (file?.type?.startsWith("audio/")) {
      return <Music size={18} className="text-[#d14b9a]" />;
    }

    if (
      ["js", "jsx", "ts", "tsx", "css", "html", "htm", "json", "xml"].includes(
        extension,
      )
    ) {
      return <Code size={18} className="text-[#3f7fc4]" />;
    }

    return <File size={18} className="text-[#f47a32]" />;
  };

  /* ==========================================
     PREVIEW TYPE
  ========================================== */

  const getPreviewType = (file) => {
    if (!file) {
      return "unsupported";
    }

    const extension = getFileExtension(file);

    /* IMAGE */

    if (
      file.type?.startsWith("image/") ||
      ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp", "ico"].includes(
        extension,
      )
    ) {
      return "image";
    }

    /* PDF */

    if (file.type === "application/pdf" || extension === "pdf") {
      return "pdf";
    }

    /* VIDEO */

    if (file.type?.startsWith("video/")) {
      return "video";
    }

    /* AUDIO */

    if (file.type?.startsWith("audio/")) {
      return "audio";
    }

    /* DOCX */

    if (
      extension === "docx" ||
      file.type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      return "docx";
    }

    /* SPREADSHEET */

    if (
      ["xlsx", "xls"].includes(extension) ||
      file.type === "application/vnd.ms-excel" ||
      file.type ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ) {
      return "spreadsheet";
    }

    /* MARKDOWN */

    if (extension === "md" || extension === "markdown") {
      return "markdown";
    }

    /* JSON */

    if (extension === "json" || file.type === "application/json") {
      return "json";
    }

    /* ZIP (list contents) */

    if (extension === "zip") {
      return "zip";
    }

    /* TEXT / CODE */

    const textExtensions = [
      "txt",
      "csv",
      "js",
      "jsx",
      "ts",
      "tsx",
      "css",
      "html",
      "htm",
      "xml",
      "log",
      "yml",
      "yaml",
      "sql",
    ];

    const textMimeTypes = [
      "text/plain",
      "text/csv",
      "text/html",
      "text/css",
      "application/xml",
      "text/xml",
      "application/javascript",
    ];

    if (
      textExtensions.includes(extension) ||
      textMimeTypes.includes(file.type)
    ) {
      return "text";
    }

    return "unsupported";
  };

  /* ==========================================
     PREVIEW FILE
  ========================================== */

  const openPreview = (file) => {
    setPreviewFile(file);
  };

  /* ==========================================
     CLOSE PREVIEW
  ========================================== */

  const closePreview = () => {
    setPreviewFile(null);
    setTextPreview("");
    setTextLoading(false);
    setDocxHtml("");
    setDocxLoading(false);
    setSheetHtml("");
    setSheetLoading(false);
    setZipEntries([]);
    setZipLoading(false);
  };

  /* ==========================================
     MANAGE PREVIEW URL
  ========================================== */

  useEffect(() => {
    if (!previewFile) {
      setPreviewUrl(null);
      return;
    }

    const url = URL.createObjectURL(previewFile);
    setPreviewUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [previewFile]);

  /* ==========================================
     LOAD TEXT PREVIEW
  ========================================== */

  useEffect(() => {
    if (!previewFile) {
      return;
    }

    const previewType = getPreviewType(previewFile);

    // Only load text for text, json, and markdown types
    if (!["text", "json", "markdown"].includes(previewType)) {
      setTextPreview("");
      setTextLoading(false);
      return;
    }

    let cancelled = false;

    const loadText = async () => {
      try {
        setTextLoading(true);
        setTextPreview("");

        /*
         * Text files ko unnecessarily
         * bahut bada render nahi karna.
         *
         * 5 MB tak preview.
         */
        const MAX_TEXT_PREVIEW_SIZE = 5 * 1024 * 1024;

        if (previewFile.size > MAX_TEXT_PREVIEW_SIZE) {
          if (!cancelled) {
            setTextPreview(
              "This file is too large for an in-browser preview. Please download the file to view it.",
            );
          }
          return;
        }

        const content = await previewFile.text();

        if (!cancelled) {
          setTextPreview(content);
        }
      } catch (error) {
        console.error("Text preview error:", error);

        if (!cancelled) {
          setTextPreview("Unable to preview this file.");
        }
      } finally {
        if (!cancelled) {
          setTextLoading(false);
        }
      }
    };

    loadText();

    return () => {
      cancelled = true;
    };
  }, [previewFile]);

  /* ==========================================
     LOAD ASYNC PREVIEWS (DOCX, XLSX, ZIP)
  ========================================== */

  useEffect(() => {
    if (!previewFile) return;

    const previewType = getPreviewType(previewFile);
    let cancelled = false;

    const loadDocx = async () => {
      try {
        setDocxLoading(true);
        const mammoth = await import("mammoth");
        const arrayBuffer = await previewFile.arrayBuffer();
        const result = await mammoth.convertToHtml({ arrayBuffer });
        if (!cancelled) setDocxHtml(result.value);
      } catch (err) {
        console.error("DOCX preview error:", err);
        if (!cancelled) setDocxHtml("<p>Unable to preview this document.</p>");
      } finally {
        if (!cancelled) setDocxLoading(false);
      }
    };

    const loadSpreadsheet = async () => {
      try {
        setSheetLoading(true);
        const XLSX = await import("xlsx");
        const arrayBuffer = await previewFile.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: "array" });
        const firstSheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[firstSheetName];
        const html = XLSX.utils.sheet_to_html(sheet);
        if (!cancelled) setSheetHtml(html);
      } catch (err) {
        console.error("Spreadsheet preview error:", err);
        if (!cancelled)
          setSheetHtml("<p>Unable to preview this spreadsheet.</p>");
      } finally {
        if (!cancelled) setSheetLoading(false);
      }
    };

    const loadZip = async () => {
      try {
        setZipLoading(true);
        const JSZip = (await import("jszip")).default;
        const zip = await JSZip.loadAsync(previewFile);
        const entries = Object.values(zip.files).map((entry) => ({
          name: entry.name,
          dir: entry.dir,
        }));
        if (!cancelled) setZipEntries(entries);
      } catch (err) {
        console.error("Zip preview error:", err);
        if (!cancelled) setZipEntries([]);
      } finally {
        if (!cancelled) setZipLoading(false);
      }
    };

    if (previewType === "docx") loadDocx();
    if (previewType === "spreadsheet") loadSpreadsheet();
    if (previewType === "zip") loadZip();

    return () => {
      cancelled = true;
    };
  }, [previewFile]);

  /* ==========================================
     TRAVERSE FILE TREE (for folder drops)
  ========================================== */

  const traverseFileTree = (entry, path = "") => {
    return new Promise((resolve) => {
      if (entry.isFile) {
        entry.file((file) => {
          // Attach relativePath manually since File objects don't have it
          Object.defineProperty(file, "relativePath", {
            value: path + file.name,
            writable: false,
          });
          resolve([file]);
        });
      } else if (entry.isDirectory) {
        const dirReader = entry.createReader();

        // Read all entries from the directory (handles large directories)
        const readAllEntries = () => {
          return new Promise((resolve) => {
            let allEntries = [];
            const readBatch = () => {
              dirReader.readEntries((batch) => {
                if (batch.length === 0) {
                  resolve(allEntries);
                } else {
                  allEntries = allEntries.concat(batch);
                  readBatch();
                }
              });
            };
            readBatch();
          });
        };

        readAllEntries().then(async (entries) => {
          const filesNested = await Promise.all(
            entries.map((childEntry) =>
              traverseFileTree(childEntry, path + entry.name + "/"),
            ),
          );
          resolve(filesNested.flat());
        });
      } else {
        resolve([]);
      }
    });
  };

  /* ==========================================
     ADD FILES
  ========================================== */

  const addFiles = (newFiles) => {
    if (disabled) {
      return;
    }

    const incomingFiles = Array.from(newFiles || []);
    const validFiles = [];

    incomingFiles.forEach((file) => {
      /* FILE SIZE */

      if (file.size > MAX_FILE_SIZE) {
        console.error(`${file.name} exceeds the 60MB file size limit.`);
        return;
      }

      /* DUPLICATE - check by name, size, and relativePath if available */
      const alreadyExists = files.some(
        (existingFile) =>
          existingFile.name === file.name &&
          existingFile.size === file.size &&
          existingFile.lastModified === file.lastModified &&
          (existingFile.relativePath || existingFile.name) ===
          (file.relativePath || file.name),
      );

      if (!alreadyExists) {
        validFiles.push(file);
      }
    });

    if (validFiles.length > 0) {
      onFilesChange([...files, ...validFiles]);
    }
  };

  /* ==========================================
     INPUT CHANGE
  ========================================== */

  const handleInputChange = (event) => {
    addFiles(event.target.files);
    event.target.value = "";
  };

  /* ==========================================
     FOLDER INPUT CHANGE
  ========================================== */

  const handleFolderInputChange = (event) => {
    const selected = Array.from(event.target.files || []);

    const filesWithRelativePath = selected.map((file) => {
      if (file.webkitRelativePath) {
        Object.defineProperty(file, "relativePath", {
          value: file.webkitRelativePath,
          writable: false,
        });
      }
      return file;
    });

    addFiles(filesWithRelativePath);
    event.target.value = "";
  };

  /* ==========================================
     DROP - Updated with folder traversal
  ========================================== */

  const handleDrop = async (event) => {
    event.preventDefault();
    setIsDragging(false);

    if (disabled) {
      return;
    }

    const items = event.dataTransfer.items;

    // Check if browser supports webkitGetAsEntry for folder traversal
    if (items && items[0]?.webkitGetAsEntry) {
      const entries = Array.from(items)
        .map((item) => item.webkitGetAsEntry())
        .filter(Boolean);

      const allFiles = await Promise.all(
        entries.map((entry) => traverseFileTree(entry)),
      );

      addFiles(allFiles.flat());
    } else {
      // Fallback for browsers without webkitGetAsEntry support
      addFiles(event.dataTransfer.files);
    }
  };

  /* ==========================================
     REMOVE FILE
  ========================================== */

  const removeFile = (index) => {
    if (disabled) {
      return;
    }

    const fileToRemove = files[index];

    if (previewFile === fileToRemove) {
      closePreview();
    }

    onFilesChange(files.filter((_, fileIndex) => fileIndex !== index));
  };

  /* ==========================================
     DOWNLOAD PREVIEW FILE
  ========================================== */

  const downloadFile = () => {
    if (!previewFile) {
      return;
    }

    const url = URL.createObjectURL(previewFile);
    const link = document.createElement("a");

    link.href = url;
    link.download = previewFile.name;

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  };

  /* ==========================================
     PREVIEW CONTENT
  ========================================== */

  const renderPreviewContent = () => {
    if (!previewFile) {
      return null;
    }

    const previewType = getPreviewType(previewFile);

    if (previewType === "image") {
      return (
        <div className="flex max-h-[65vh] min-h-[300px] items-center justify-center overflow-auto rounded-xl bg-[#f5f6f8] p-4">
          <img
            src={previewUrl}
            alt={previewFile.name}
            className="max-h-[60vh] max-w-full rounded-lg object-contain shadow-sm"
          />
        </div>
      );
    }

    if (previewType === "pdf") {
      return (
        <div className="h-[65vh] overflow-hidden rounded-xl border border-[#ececef] bg-[#f5f6f8]">
          <iframe
            src={previewUrl}
            title={previewFile.name}
            className="h-full w-full"
          />
        </div>
      );
    }

    if (previewType === "video") {
      return (
        <div className="flex min-h-[300px] items-center justify-center rounded-xl bg-[#151515] p-4">
          <video
            src={previewUrl}
            controls
            className="max-h-[65vh] max-w-full rounded-lg"
          >
            Your browser does not support video preview.
          </video>
        </div>
      );
    }

    if (previewType === "audio") {
      return (
        <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl bg-[#f5f6f8] p-8">
          <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-[#fff0e7] text-[#f47a32]">
            <Music size={36} />
          </div>

          <div className="mb-5 max-w-full truncate text-sm font-semibold text-[#303238]">
            {previewFile.name}
          </div>

          <audio src={previewUrl} controls className="w-full max-w-[500px]">
            Your browser does not support audio preview.
          </audio>
        </div>
      );
    }

    if (previewType === "docx") {
      return (
        <div className="h-[65vh] overflow-auto rounded-xl border border-[#ececef] bg-white p-6">
          {docxLoading ? (
            <div className="flex h-full items-center justify-center text-sm text-[#9a9da3]">
              Loading document...
            </div>
          ) : (
            <div
              className="prose max-w-none text-sm"
              dangerouslySetInnerHTML={{ __html: docxHtml }}
            />
          )}
        </div>
      );
    }

    if (previewType === "spreadsheet") {
      return (
        <div className="h-[65vh] overflow-auto rounded-xl border border-[#ececef] bg-white p-4">
          {sheetLoading ? (
            <div className="flex h-full items-center justify-center text-sm text-[#9a9da3]">
              Loading spreadsheet...
            </div>
          ) : (
            <div
              className="[&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:border-[#ececef] [&_td]:px-2 [&_td]:py-1 [&_td]:text-xs"
              dangerouslySetInnerHTML={{ __html: sheetHtml }}
            />
          )}
        </div>
      );
    }

    if (previewType === "markdown") {
      return (
        <div className="h-[65vh] overflow-auto rounded-xl border border-[#ececef] bg-white p-6">
          {textLoading ? (
            <div className="flex h-full items-center justify-center text-sm text-[#9a9da3]">
              Loading preview...
            </div>
          ) : (
            <MarkdownPreview content={textPreview} />
          )}
        </div>
      );
    }

    if (previewType === "json") {
      let formatted = textPreview;
      try {
        formatted = JSON.stringify(JSON.parse(textPreview), null, 2);
      } catch {
        // leave as-is if it doesn't parse
      }
      return (
        <div className="h-[65vh] overflow-auto rounded-xl border border-[#ececef] bg-[#151515] p-5">
          <pre className="whitespace-pre-wrap break-words font-mono text-[12px] leading-[1.7] text-[#e8e8e8]">
            {formatted}
          </pre>
        </div>
      );
    }

    if (previewType === "zip") {
      return (
        <div className="h-[65vh] overflow-auto rounded-xl border border-[#ececef] bg-white p-4">
          {zipLoading ? (
            <div className="flex h-full items-center justify-center text-sm text-[#9a9da3]">
              Reading archive...
            </div>
          ) : zipEntries.length === 0 ? (
            <div className="text-sm text-[#9a9da3]">
              No entries found or unable to read archive.
            </div>
          ) : (
            <ul className="space-y-1 text-xs text-[#303238]">
              {zipEntries.map((entry) => (
                <li key={entry.name} className="flex items-center gap-2">
                  {entry.dir ? (
                    <Folder size={13} className="text-[#f47a32]" />
                  ) : (
                    <File size={13} className="text-[#9a9da3]" />
                  )}
                  <span className="truncate">{entry.name}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      );
    }

    if (previewType === "text") {
      return (
        <div className="h-[65vh] overflow-auto rounded-xl border border-[#ececef] bg-[#151515] p-5">
          {textLoading ? (
            <div className="flex h-full items-center justify-center text-sm text-[#9a9da3]">
              Loading preview...
            </div>
          ) : (
            <pre className="whitespace-pre-wrap break-words font-mono text-[12px] leading-[1.7] text-[#e8e8e8]">
              {textPreview || "This file is empty."}
            </pre>
          )}
        </div>
      );
    }

    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl bg-[#f5f6f8] p-8 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#fff3eb] text-[#f47a32]">
          {getFileIcon(previewFile)}
        </div>

        <h3 className="mt-4 max-w-[420px] break-all text-base font-semibold text-[#303238]">
          {previewFile.name}
        </h3>

        <p className="mt-2 max-w-[420px] text-sm leading-6 text-[#777b82]">
          Preview is not available for this file type in the browser. You can
          download the file to open it with the appropriate application.
        </p>
      </div>
    );
  };

  /* ==========================================
     PREVIEW MODAL
  ========================================== */

  const renderPreviewModal = () => {
    if (!previewFile) {
      return null;
    }

    return createPortal(
      <div
        className="fixed inset-0 z-[300] flex items-center justify-center bg-black/50 p-4 backdrop-blur-[4px]"
        onClick={closePreview}
      >
        <div
          className="flex max-h-[90vh] w-full max-w-[1000px] flex-col overflow-hidden rounded-2xl bg-white shadow-[0_24px_80px_rgba(0,0,0,0.25)]"
          onClick={(event) => event.stopPropagation()}
        >
          {/* MODAL HEADER */}

          <div className="flex items-center justify-between gap-4 border-b border-[#ececef] px-5 py-4">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#fff3eb]">
                {getFileIcon(previewFile)}
              </div>

              <div className="min-w-0">
                <h2
                  className="truncate text-sm font-semibold text-[#303238]"
                  title={previewFile.name}
                >
                  {previewFile.name}
                </h2>

                <p className="mt-0.5 text-[11px] text-[#9a9da3]">
                  {formatFileSize(previewFile.size)}
                  {previewFile.type ? ` • ${previewFile.type}` : ""}
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                onClick={downloadFile}
                title="Download file"
                className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-lg
                  text-[#777b82]
                  transition
                  hover:bg-[#fff3eb]
                  hover:text-[#f47a32]
                "
              >
                <Download size={17} />
              </button>

              <button
                type="button"
                onClick={closePreview}
                title="Close preview"
                className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-lg
                  text-[#777b82]
                  transition
                  hover:bg-[#f5f6f8]
                  hover:text-[#303238]
                "
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* MODAL BODY */}

          <div className="overflow-auto p-5">{renderPreviewContent()}</div>

          {/* MODAL FOOTER */}

          <div className="flex items-center justify-between border-t border-[#ececef] bg-[#fafafa] px-5 py-3">
            <span className="truncate text-[11px] text-[#9a9da3]">
              {getPreviewType(previewFile) === "unsupported"
                ? "Browser preview is not available for this file type."
                : "File preview"}
            </span>

            <button
              type="button"
              onClick={downloadFile}
              className="
                inline-flex
                h-9
                items-center
                gap-2
                rounded-lg
                bg-[#f47a32]
                px-4
                text-[12px]
                font-semibold
                text-white
                transition
                hover:bg-[#e86d28]
              "
            >
              <Download size={15} />
              Download
            </button>
          </div>
        </div>
      </div>,
      document.body,
    );
  };

  /* ==========================================
     GROUP FILES
  ========================================== */

  const groupedFiles = useMemo(() => {
    const rootFiles = [];
    const folders = {};

    files.forEach((file, index) => {
      if (file.relativePath && file.relativePath.includes("/")) {
        const topFolder = file.relativePath.split("/")[0];
        if (!folders[topFolder]) folders[topFolder] = [];
        folders[topFolder].push({ file, index });
      } else {
        rootFiles.push({ file, index });
      }
    });

    return { rootFiles, folders };
  }, [files]);

  return (
    <div>
      {/* ==========================================
          LABEL
      ========================================== */}

      <div className="mb-2">
        <label className="block text-[13px] font-semibold text-[#303238]">
          Upload Files
          <span className="ml-1 text-[#f47a32]">*</span>
        </label>

        <p className="mt-1 text-xs text-[#9a9da3]">
          Select one or more files to include in the ZIP package.
        </p>

        <p className="mt-1 text-xs text-[#9a9da3]">Max size 600MB per file</p>
      </div>

      {/* ==========================================
          HIDDEN INPUTS
      ========================================== */}

      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleInputChange}
        disabled={disabled}
      />

      <input
        ref={folderInputRef}
        type="file"
        webkitdirectory=""
        directory=""
        multiple
        className="hidden"
        onChange={handleFolderInputChange}
        disabled={disabled}
      />

      {/* ==========================================
          DROP ZONE
      ========================================== */}

      <div
        onClick={() => {
          if (!disabled) {
            fileInputRef.current?.click();
          }
        }}
        onDragOver={(event) => {
          event.preventDefault();

          if (!disabled) {
            setIsDragging(true);
          }
        }}
        onDragLeave={(event) => {
          if (event.currentTarget === event.target) {
            setIsDragging(false);
          }
        }}
        onDrop={handleDrop}
        className={`
          flex
          min-h-[240px]
          cursor-pointer
          flex-col
          items-center
          justify-center
          rounded-xl
          border-2
          border-dashed
          px-5
          py-8
          text-center
          transition-all
          ${isDragging
            ? "border-[#f47a32] bg-[#fff7f2]"
            : "border-[#dfe1e5] bg-[#fafbfc] hover:border-[#f47a32] hover:bg-[#fffaf7]"
          }
          ${disabled ? "cursor-not-allowed opacity-60" : ""}
        `}
      >
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#fff0e7] text-[#f47a32]">
          <UploadCloud size={28} />
        </div>

        <div className="text-sm font-semibold text-[#303238]">
          Drag & drop files here
        </div>

        <div className="mt-1 text-[13px] text-[#777b82]">
          or click to browse
        </div>

        <div className="mt-4 flex gap-3">
          <button
            type="button"
            disabled={disabled}
            onClick={(event) => {
              event.stopPropagation();
              if (!disabled) fileInputRef.current?.click();
            }}
            className="rounded-[9px] border border-[#f47a32] bg-white px-5 py-2 text-[13px] font-semibold text-[#f47a32] transition hover:bg-[#fff5ef] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Choose Files
          </button>

          <button
            type="button"
            disabled={disabled}
            onClick={(event) => {
              event.stopPropagation();
              if (!disabled) folderInputRef.current?.click();
            }}
            className="rounded-[9px] border border-[#f47a32] bg-white px-5 py-2 text-[13px] font-semibold text-[#f47a32] transition hover:bg-[#fff5ef] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Choose Folder
          </button>
        </div>

        <div className="mt-3 text-xs text-[#9a9da3]">
          Multiple files can be selected
        </div>

        <div className="mt-1 text-[11px] text-[#b0b3b8]">
          Maximum 600MB per file
        </div>
      </div>

      {/* ==========================================
          SELECTED FILES
      ========================================== */}

      {files.length > 0 && (
        <div className="mt-4 rounded-xl border border-[#ececef] bg-[#fafafa] p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[12px] font-semibold text-[#55585d]">
              Selected files
            </span>

            <span className="text-[11px] text-[#9a9da3]">
              {files.length} {files.length === 1 ? "file" : "files"}
            </span>
          </div>

          <div className="space-y-3">
            {/* FOLDER GROUPS */}
            {Object.entries(groupedFiles.folders).map(
              ([folderName, entries]) => (
                <div
                  key={folderName}
                  className="rounded-lg border border-[#ececef] bg-white"
                >
                  <div className="flex items-center gap-2 border-b border-[#ececef] bg-[#fafbfc] px-3 py-2">
                    <Folder size={15} className="text-[#f47a32]" />
                    <span className="text-[12px] font-semibold text-[#303238]">
                      {folderName}
                    </span>
                    <span className="ml-auto text-[11px] text-[#9a9da3]">
                      {entries.length} {entries.length === 1 ? "file" : "files"}
                    </span>
                  </div>

                  <div className="space-y-1 p-2">
                    {entries.map(({ file, index }) => (
                      <div
                        key={`${file.name}-${file.lastModified}-${index}`}
                        onClick={() => openPreview(file)}
                        className="group flex cursor-pointer items-center justify-between gap-3 rounded-md px-2 py-1.5 transition hover:bg-[#fffaf7]"
                        title="Click to preview"
                      >
                        <div className="flex min-w-0 items-center gap-2">
                          {getFileIcon(file)}
                          <span
                            className="truncate text-[12px] text-[#303238]"
                            title={file.relativePath}
                          >
                            {file.relativePath.split("/").slice(1).join("/")}
                          </span>
                          <span className="shrink-0 text-[10px] text-[#9a9da3]">
                            {formatFileSize(file.size)}
                          </span>
                        </div>

                        <button
                          type="button"
                          disabled={disabled}
                          onClick={(event) => {
                            event.stopPropagation();
                            removeFile(index);
                          }}
                          className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-[#9a9da3] transition hover:bg-[#fef2f0] hover:text-[#dc3545] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ),
            )}

            {/* ROOT-LEVEL LOOSE FILES */}
            {groupedFiles.rootFiles.map(({ file, index }) => (
              <div
                key={`${file.name}-${file.lastModified}-${index}`}
                onClick={() => openPreview(file)}
                className="group flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-[#ececef] bg-white px-3 py-2.5 transition hover:border-[#f47a32] hover:bg-[#fffaf7]"
                title="Click to preview"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#fff3eb]">
                    {getFileIcon(file)}
                  </div>
                  <div className="min-w-0">
                    <div
                      className="truncate text-[13px] font-medium text-[#303238]"
                      title={file.name}
                    >
                      {file.name}
                    </div>
                    <div className="mt-0.5 text-[11px] text-[#9a9da3]">
                      {formatFileSize(file.size)}
                    </div>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={(event) => {
                      event.stopPropagation();
                      openPreview(file);
                    }}
                    title="Preview file"
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-[#9a9da3] transition hover:bg-[#fff3eb] hover:text-[#f47a32] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Eye size={17} />
                  </button>
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={(event) => {
                      event.stopPropagation();
                      removeFile(index);
                    }}
                    title="Remove file"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#9a9da3] transition hover:bg-[#fef2f0] hover:text-[#dc3545] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <X size={17} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==========================================
          FILE COUNT
      ========================================== */}

      <div className="mt-2 text-xs text-[#9a9da3]">
        {files.length === 0
          ? "No files selected"
          : `${files.length} ${files.length === 1 ? "file" : "files"} selected`}
      </div>

      {/* ==========================================
          PREVIEW MODAL (PORTALED)
      ========================================== */}

      {renderPreviewModal()}
    </div>
  );
};

export default ZipFileUpload;
