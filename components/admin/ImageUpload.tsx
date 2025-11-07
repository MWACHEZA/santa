import React, { useState, useRef } from 'react';
import { Upload, X, Image, AlertCircle, CheckCircle } from 'lucide-react';
import './ImageUpload.css';

interface ImageUploadProps {
  onImageSelect: (file: File, previewUrl: string) => void;
  onImageRemove?: () => void;
  currentImageUrl?: string;
  acceptedTypes?: string[];
  maxSizeInMB?: number;
  label?: string;
  required?: boolean;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  onImageSelect,
  onImageRemove,
  currentImageUrl,
  acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  maxSizeInMB = 5,
  label = 'Upload Image',
  required = false
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>(currentImageUrl || '');
  const [error, setError] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    // Check file type
    if (!acceptedTypes.includes(file.type)) {
      return `Invalid file type. Accepted types: ${acceptedTypes.map(type => type.split('/')[1]).join(', ')}`;
    }

    // Check file size
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      return `File size too large. Maximum size: ${maxSizeInMB}MB`;
    }

    return null;
  };

  const handleFileSelect = (file: File) => {
    setError('');
    
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setUploading(true);

    // Create preview URL
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setPreviewUrl(result);
      setUploading(false);
      onImageSelect(file, result);
    };
    reader.onerror = () => {
      setError('Failed to read file');
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleRemoveImage = () => {
    setPreviewUrl('');
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (onImageRemove) {
      onImageRemove();
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="image-upload-container">
      <label className="image-upload-label">
        {label} {required && <span className="required">*</span>}
      </label>

      {!previewUrl ? (
        <div
          className={`image-upload-area ${dragActive ? 'drag-active' : ''} ${error ? 'error' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={openFileDialog}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={acceptedTypes.join(',')}
            onChange={handleInputChange}
            className="file-input"
          />
          
          <div className="upload-content">
            {uploading ? (
              <div className="upload-loading">
                <div className="spinner"></div>
                <p>Uploading...</p>
              </div>
            ) : (
              <>
                <Upload size={48} className="upload-icon" />
                <h3>Drop your image here</h3>
                <p>or <span className="browse-text">browse</span> to choose a file</p>
                <div className="upload-info">
                  <p>Supported formats: {acceptedTypes.map(type => type.split('/')[1].toUpperCase()).join(', ')}</p>
                  <p>Maximum size: {maxSizeInMB}MB</p>
                </div>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="image-preview-container">
          <div className="image-preview">
            <img src={previewUrl} alt="Preview" className="preview-image" />
            <div className="image-overlay">
              <button
                type="button"
                onClick={handleRemoveImage}
                className="remove-image-btn"
                title="Remove image"
              >
                <X size={20} />
              </button>
              <button
                type="button"
                onClick={openFileDialog}
                className="change-image-btn"
                title="Change image"
              >
                <Image size={20} />
              </button>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept={acceptedTypes.join(',')}
            onChange={handleInputChange}
            className="file-input"
          />
        </div>
      )}

      {error && (
        <div className="upload-error">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {previewUrl && !error && (
        <div className="upload-success">
          <CheckCircle size={16} />
          <span>Image ready for upload</span>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
