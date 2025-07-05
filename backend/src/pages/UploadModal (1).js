import React, { useState, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import { supabaseClient } from "../config/supabase";

const UploadModal = ({ onClose, onUploadComplete }) => {
  const { user, isAdmin } = useAuth();
  const [dragActive, setDragActive] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [songData, setSongData] = useState({
    title: "",
    artist: "",
    genre: "Pop",
    difficulty: "Medium",
    language: "Indonesia",
  });
  const fileInputRef = useRef(null);

  const allowedTypes = {
    audio: [".mp3", ".wav", ".m4a", ".aac", ".ogg", ".flac"],
    video: [".mp4", ".mov", ".avi", ".mkv", ".webm"],
    lyrics: [".lrc", ".txt"],
  };

  const getFileType = (fileName) => {
    const ext = fileName.toLowerCase().substring(fileName.lastIndexOf("."));
    if (allowedTypes.audio.includes(ext)) return "audio";
    if (allowedTypes.video.includes(ext)) return "video";
    if (allowedTypes.lyrics.includes(ext)) return "lyrics";
    return "unknown";
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer?.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = (file) => {
    const fileType = getFileType(file.name);

    if (fileType === "unknown") {
      alert(
        "Format file tidak didukung. Gunakan MP3, MP4, atau file yang didukung.",
      );
      return;
    }

    if (file.size > 100 * 1024 * 1024) {
      // 100MB limit
      alert("File terlalu besar. Maksimal 100MB.");
      return;
    }

    setUploadFile(file);

    // Auto-fill title from filename
    const fileName = file.name.replace(/\.[^/.]+$/, "");
    setSongData((prev) => ({
      ...prev,
      title: prev.title || fileName,
    }));
  };

  const handleFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleUpload = async () => {
    if (!uploadFile || !songData.title.trim()) {
      alert("Mohon pilih file dan isi informasi lagu!");
      return;
    }

    if (!user) {
      alert("Silakan login terlebih dahulu!");
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);

      const fileType = getFileType(uploadFile.name);
      const timestamp = Date.now();
      const fileName = `${timestamp}_${uploadFile.name.replace(/[^a-zA-Z0-9.]/g, "_")}`;

      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } =
        await supabaseClient.storage
          .from("songs")
          .upload(fileName, uploadFile, {
            cacheControl: "3600",
            upsert: false,
            onUploadProgress: (progress) => {
              setUploadProgress((progress.loaded / progress.total) * 100);
            },
          });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: urlData } = supabaseClient.storage
        .from("songs")
        .getPublicUrl(fileName);

      // Save song metadata to database
      const songRecord = {
        title: songData.title,
        artist: songData.artist || "Unknown Artist",
        genre: songData.genre,
        difficulty: songData.difficulty,
        language: songData.language,
        file_url: urlData.publicUrl,
        file_name: fileName,
        file_type: fileType,
        file_size: uploadFile.size,
        uploaded_by: user.id,
        uploaded_at: new Date().toISOString(),
        duration: null, // Will be detected later
        status: isAdmin ? "approved" : "pending",
      };

      const { data: songData, error: dbError } = await supabaseClient
        .from("songs")
        .insert([songRecord])
        .select()
        .single();

      if (dbError) {
        throw dbError;
      }

      const successMessage = isAdmin
        ? `✅ Lagu "${songRecord.title}" berhasil diupload dan langsung tersedia di galeri publik!`
        : `✅ Lagu "${songRecord.title}" berhasil diupload!\n\n🎵 Terima kasih atas kontribusi Anda untuk galeri musik komunitas!\n\nLagu akan direview admin dan segera tersedia untuk semua pengguna.`;

      alert(successMessage);

      if (onUploadComplete) {
        onUploadComplete(songData);
      }

      onClose();
    } catch (error) {
      console.error("Upload failed:", error);
      alert(`❌ Upload gagal: ${error.message}`);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const removeFile = () => {
    setUploadFile(null);
    setUploadProgress(0);
  };

  const getFileIcon = (fileType) => {
    switch (fileType) {
      case "audio":
        return "fas fa-music";
      case "video":
        return "fas fa-video";
      case "lyrics":
        return "fas fa-file-alt";
      default:
        return "fas fa-file";
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal} className="card">
        <div style={styles.header}>
          <h3 style={styles.title}>
            <i className="fas fa-upload"></i>
            Kontribusi ke Galeri Musik Publik
          </h3>
          <button onClick={onClose} style={styles.closeButton}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Public Contribution Notice */}
        <div style={styles.publicNotice}>
          <div style={styles.noticeIcon}>
            <i className="fas fa-users"></i>
          </div>
          <div style={styles.noticeText}>
            <strong>🎵 Bangun Galeri Musik Bersama!</strong>
            <p>
              Lagu yang Anda upload akan tersedia untuk semua pengguna dan
              membantu memperkaya koleksi karaoke komunitas.
            </p>
          </div>
        </div>

        <div style={styles.content}>
          {/* Upload Area */}
          <div
            style={{
              ...styles.uploadArea,
              ...(dragActive ? styles.uploadAreaActive : {}),
            }}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={handleFileInput}
          >
            <input
              ref={fileInputRef}
              type="file"
              style={styles.hiddenInput}
              accept={[
                ...allowedTypes.audio,
                ...allowedTypes.video,
                ...allowedTypes.lyrics,
              ].join(",")}
              onChange={(e) =>
                e.target.files?.[0] && handleFileSelect(e.target.files[0])
              }
            />

            {uploadFile ? (
              <div style={styles.filePreview}>
                <div style={styles.fileInfo}>
                  <i
                    className={getFileIcon(getFileType(uploadFile.name))}
                    style={styles.fileIcon}
                  ></i>
                  <div style={styles.fileDetails}>
                    <div style={styles.fileName}>{uploadFile.name}</div>
                    <div style={styles.fileSize}>
                      {(uploadFile.size / (1024 * 1024)).toFixed(2)} MB
                    </div>
                    <div style={styles.fileType}>
                      {getFileType(uploadFile.name).toUpperCase()}
                    </div>
                  </div>
                  <button onClick={removeFile} style={styles.removeButton}>
                    <i className="fas fa-trash"></i>
                  </button>
                </div>

                {uploading && (
                  <div style={styles.progressContainer}>
                    <div style={styles.progressBar}>
                      <div
                        style={{
                          ...styles.progressFill,
                          width: `${uploadProgress}%`,
                        }}
                      ></div>
                    </div>
                    <div style={styles.progressText}>
                      {uploadProgress.toFixed(1)}%
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div style={styles.uploadPrompt}>
                <i
                  className="fas fa-cloud-upload-alt"
                  style={styles.uploadIcon}
                ></i>
                <div style={styles.uploadText}>
                  <strong>Klik atau drag & drop file di sini</strong>
                  <p style={styles.uploadSubtext}>
                    Mendukung MP3, MP4, WAV, dan format lainnya (max 100MB)
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Song Information Form */}
          <div style={styles.form}>
            <h4 style={styles.formTitle}>Informasi Lagu</h4>

            <div style={styles.formRow}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Judul Lagu *</label>
                <input
                  type="text"
                  value={songData.title}
                  onChange={(e) =>
                    setSongData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  style={styles.input}
                  placeholder="Masukkan judul lagu"
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Artis / Penyanyi</label>
                <input
                  type="text"
                  value={songData.artist}
                  onChange={(e) =>
                    setSongData((prev) => ({ ...prev, artist: e.target.value }))
                  }
                  style={styles.input}
                  placeholder="Nama artis"
                />
              </div>
            </div>

            <div style={styles.formRow}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Genre</label>
                <select
                  value={songData.genre}
                  onChange={(e) =>
                    setSongData((prev) => ({ ...prev, genre: e.target.value }))
                  }
                  style={styles.select}
                >
                  <option value="Pop">Pop</option>
                  <option value="Rock">Rock</option>
                  <option value="Dangdut">Dangdut</option>
                  <option value="Jazz">Jazz</option>
                  <option value="Electronic">Electronic</option>
                  <option value="Hip Hop">Hip Hop</option>
                  <option value="R&B">R&B</option>
                  <option value="Country">Country</option>
                  <option value="Folk">Folk</option>
                  <option value="Classical">Classical</option>
                </select>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Tingkat Kesulitan</label>
                <select
                  value={songData.difficulty}
                  onChange={(e) =>
                    setSongData((prev) => ({
                      ...prev,
                      difficulty: e.target.value,
                    }))
                  }
                  style={styles.select}
                >
                  <option value="Easy">Mudah</option>
                  <option value="Medium">Sedang</option>
                  <option value="Hard">Sulit</option>
                </select>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Bahasa</label>
                <select
                  value={songData.language}
                  onChange={(e) =>
                    setSongData((prev) => ({
                      ...prev,
                      language: e.target.value,
                    }))
                  }
                  style={styles.select}
                >
                  <option value="Indonesia">Indonesia</option>
                  <option value="English">English</option>
                  <option value="Korean">Korean</option>
                  <option value="Japanese">Japanese</option>
                  <option value="Mandarin">Mandarin</option>
                  <option value="Other">Lainnya</option>
                </select>
              </div>
            </div>

            {!isAdmin && (
              <div style={styles.notice}>
                <i className="fas fa-info-circle"></i>
                <span>
                  Lagu yang diupload akan direview oleh admin sebelum
                  dipublikasi
                </span>
              </div>
            )}
          </div>
        </div>

        <div style={styles.actions}>
          <button onClick={onClose} className="btn btn-secondary">
            Batal
          </button>
          <button
            onClick={handleUpload}
            disabled={!uploadFile || uploading || !songData.title.trim()}
            className="btn btn-primary"
            style={styles.uploadButton}
          >
            {uploading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                Uploading...
              </>
            ) : (
              <>
                <i className="fas fa-upload"></i>
                Upload Lagu
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.8)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10000,
    padding: "20px",
  },
  modal: {
    maxWidth: "600px",
    width: "100%",
    maxHeight: "90vh",
    overflow: "auto",
    position: "relative",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  publicNotice: {
    background: "linear-gradient(135deg, #667eea, #764ba2)",
    borderRadius: "15px",
    padding: "20px",
    marginBottom: "25px",
    display: "flex",
    alignItems: "center",
    gap: "15px",
  },
  noticeIcon: {
    fontSize: "2rem",
    color: "white",
    opacity: 0.9,
  },
  noticeText: {
    flex: 1,
    color: "white",
  },
  title: {
    fontSize: "1.5rem",
    fontWeight: "600",
    margin: 0,
    display: "flex",
    alignItems: "center",
    gap: "10px",
    background: "linear-gradient(45deg, #ff6b6b, #feca57)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  closeButton: {
    background: "none",
    border: "none",
    color: "white",
    fontSize: "1.5rem",
    cursor: "pointer",
    padding: "5px",
  },
  content: {
    marginBottom: "25px",
  },
  uploadArea: {
    border: "2px dashed rgba(255,255,255,0.3)",
    borderRadius: "15px",
    padding: "40px 20px",
    textAlign: "center",
    cursor: "pointer",
    transition: "all 0.3s ease",
    marginBottom: "25px",
    minHeight: "200px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  uploadAreaActive: {
    borderColor: "#ff6b6b",
    background: "rgba(255, 107, 107, 0.1)",
  },
  hiddenInput: {
    display: "none",
  },
  uploadPrompt: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "15px",
  },
  uploadIcon: {
    fontSize: "3rem",
    background: "linear-gradient(45deg, #ff6b6b, #feca57)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  uploadText: {
    textAlign: "center",
  },
  uploadSubtext: {
    margin: "8px 0 0 0",
    opacity: 0.7,
    fontSize: "0.9rem",
  },
  filePreview: {
    width: "100%",
  },
  fileInfo: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    background: "rgba(255,255,255,0.1)",
    padding: "15px",
    borderRadius: "10px",
    marginBottom: "15px",
  },
  fileIcon: {
    fontSize: "2rem",
    background: "linear-gradient(45deg, #ff6b6b, #feca57)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  fileDetails: {
    flex: 1,
  },
  fileName: {
    fontWeight: "600",
    marginBottom: "5px",
  },
  fileSize: {
    fontSize: "0.9rem",
    opacity: 0.7,
  },
  fileType: {
    fontSize: "0.8rem",
    background: "rgba(255,255,255,0.2)",
    padding: "2px 8px",
    borderRadius: "8px",
    display: "inline-block",
    marginTop: "5px",
  },
  removeButton: {
    background: "rgba(244, 67, 54, 0.2)",
    border: "1px solid rgba(244, 67, 54, 0.3)",
    color: "#f44336",
    padding: "8px",
    borderRadius: "5px",
    cursor: "pointer",
  },
  progressContainer: {
    marginTop: "10px",
  },
  progressBar: {
    width: "100%",
    height: "8px",
    background: "rgba(255,255,255,0.1)",
    borderRadius: "4px",
    overflow: "hidden",
    marginBottom: "5px",
  },
  progressFill: {
    height: "100%",
    background: "linear-gradient(45deg, #ff6b6b, #feca57)",
    transition: "width 0.3s ease",
  },
  progressText: {
    textAlign: "center",
    fontSize: "0.9rem",
    opacity: 0.8,
  },
  form: {
    background: "rgba(255,255,255,0.05)",
    padding: "20px",
    borderRadius: "15px",
  },
  formTitle: {
    fontSize: "1.2rem",
    fontWeight: "600",
    marginBottom: "20px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  formRow: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "15px",
    marginBottom: "15px",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "5px",
  },
  label: {
    fontSize: "0.9rem",
    fontWeight: "500",
    opacity: 0.9,
  },
  input: {
    padding: "10px 12px",
    borderRadius: "8px",
    border: "1px solid rgba(255,255,255,0.2)",
    background: "rgba(255,255,255,0.1)",
    color: "white",
    fontSize: "14px",
    outline: "none",
  },
  select: {
    padding: "10px 12px",
    borderRadius: "8px",
    border: "1px solid rgba(255,255,255,0.2)",
    background: "rgba(255,255,255,0.1)",
    color: "white",
    fontSize: "14px",
    outline: "none",
    cursor: "pointer",
  },
  notice: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "rgba(255, 193, 7, 0.1)",
    border: "1px solid rgba(255, 193, 7, 0.3)",
    padding: "10px 15px",
    borderRadius: "8px",
    fontSize: "0.9rem",
    color: "#ffc107",
    marginTop: "15px",
  },
  actions: {
    display: "flex",
    gap: "15px",
    justifyContent: "flex-end",
  },
  uploadButton: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
};

export default UploadModal;
