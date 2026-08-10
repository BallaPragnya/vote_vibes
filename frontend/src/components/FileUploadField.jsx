import React, { useState } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, X, Image as ImageIcon } from 'lucide-react';

export default function FileUploadField({
  label,
  name,
  accept = 'image/*',
  maxSizeMB = 10,
  file,
  onFileSelect,
  error,
  helpText,
  icon: Icon = Upload,
}) {
  const [dragOver, setDragOver] = useState(false);

  const validateAndPassFile = (selectedFile) => {
    if (!selectedFile) return;

    // Validate size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (selectedFile.size > maxSizeBytes) {
      alert(`File size exceeds the ${maxSizeMB}MB maximum limit.`);
      return;
    }

    onFileSelect(selectedFile);
  };

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (selected) {
      validateAndPassFile(selected);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      validateAndPassFile(droppedFile);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
        {label}
      </label>

      {file ? (
        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400 shrink-0">
              {accept.includes('image') ? <ImageIcon className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
            </div>
            <div className="overflow-hidden text-left">
              <p className="text-xs font-semibold text-slate-200 truncate">{file.name}</p>
              <p className="text-[10px] text-slate-500">{formatFileSize(file.size)}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onFileSelect(null)}
            className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-5 text-center transition-all cursor-pointer ${
            dragOver
              ? 'border-amber-500 bg-amber-500/10'
              : 'border-slate-800 hover:border-slate-700 bg-slate-950/60'
          }`}
        >
          <input
            type="file"
            id={`file-input-${name}`}
            name={name}
            accept={accept}
            onChange={handleFileChange}
            className="hidden"
          />
          <label htmlFor={`file-input-${name}`} className="cursor-pointer block space-y-2">
            <div className="p-2.5 bg-slate-900 rounded-xl w-fit mx-auto text-slate-400">
              <Icon className="w-5 h-5" />
            </div>
            <p className="text-xs font-semibold text-slate-300">
              Click to select or drag and drop file
            </p>
            <p className="text-[10px] text-slate-500">
              {helpText || `Supported formats: ${accept} (Max: ${maxSizeMB}MB)`}
            </p>
          </label>
        </div>
      )}

      {error && (
        <p className="text-[11px] text-rose-400 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" /> {error}
        </p>
      )}
    </div>
  );
}
