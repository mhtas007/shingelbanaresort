import React, { useState } from 'react';
import { UploadCloud, AlertCircle, X } from 'lucide-react';

interface MediaUploaderProps {
  onUploadSuccess: (url: string) => void;
  currentUrl?: string;
  label?: string;
}

export default function MediaUploader({ onUploadSuccess, currentUrl, label = "Upload Image / Video" }: MediaUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Start upload
    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('reqtype', 'fileupload');
    formData.append('fileToUpload', file);

    try {
      // Using catbox.moe for free anonymous image/video hosting (up to 200MB)
      // to avoid Firebase Storage costs and quotas.
      const response = await fetch('https://catbox.moe/user/api.php', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed with status: ${response.status}`);
      }

      const url = await response.text();
      onUploadSuccess(url.trim());
    } catch (err: any) {
      setError("Upload failed. You can also paste a direct link below.");
      console.error("Catbox upload error:", err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="block text-xs font-bold text-gray-500">{label}</label>
      
      {/* Current File Preview */}
      {currentUrl && (
        <div className="relative w-full h-32 bg-gray-100 rounded-xl overflow-hidden border border-gray-200 group">
          {currentUrl.match(/\.(mp4|webm|ogg)$/i) ? (
            <video src={currentUrl} className="w-full h-full object-cover" controls muted />
          ) : (
            <img src={currentUrl} className="w-full h-full object-cover" alt="Preview" />
          )}
          <button
            type="button"
            onClick={() => onUploadSuccess('')}
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            title="Remove Media"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Upload Zone */}
      {!currentUrl && (
        <div className="relative border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:bg-gray-50 transition-colors flex flex-col items-center justify-center min-h-[120px]">
          <input
            type="file"
            accept="image/*,video/*"
            onChange={handleFileChange}
            disabled={isUploading}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          />
          {isUploading ? (
            <div className="flex flex-col items-center gap-2 w-full max-w-[200px]">
              <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-xs font-bold text-gray-500">Uploading... Please wait</span>
            </div>
          ) : (
            <>
              <UploadCloud className="w-8 h-8 text-gray-400 mb-2" />
              <span className="text-xs font-bold text-gray-500">Tap or drag to upload media</span>
            </>
          )}
        </div>
      )}

      {/* Manual URL Fallback */}
      <div className="mt-2">
        <input
          type="url"
          placeholder="Or paste URL here (https://...)"
          value={currentUrl || ''}
          onChange={(e) => onUploadSuccess(e.target.value)}
          className="w-full text-xs text-deepblue bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-deepblue transition-all"
        />
      </div>

      {error && (
        <div className="text-xs text-red-500 flex items-center gap-1 mt-1 font-bold">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
