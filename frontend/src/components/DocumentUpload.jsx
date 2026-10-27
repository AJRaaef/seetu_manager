import React, { useRef, useState, useEffect } from 'react';
import { FileText, Image as ImageIcon, X, UploadCloud, Paperclip, AlertCircle } from 'lucide-react';

const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

const DocumentUpload = ({
  id,
  label,
  required = false,
  helperText,
  file,
  existingUrl,
  onChange,
  onRemove,
  error,
  disabled = false,
}) => {
  const fileInputRef = useRef(null);
  const [localPreview, setLocalPreview] = useState(null);
  const [isPdf, setIsPdf] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [internalError, setInternalError] = useState('');

  useEffect(() => {
    if (file) {
      const isFilePdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
      setIsPdf(isFilePdf);

      if (!isFilePdf) {
        const objectUrl = URL.createObjectURL(file);
        setLocalPreview(objectUrl);
        return () => URL.revokeObjectURL(objectUrl);
      } else {
        setLocalPreview(null);
      }
    } else if (existingUrl) {
      const isUrlPdf = existingUrl.toLowerCase().endsWith('.pdf');
      setIsPdf(isUrlPdf);
      setLocalPreview(existingUrl);
    } else {
      setLocalPreview(null);
      setIsPdf(false);
    }
  }, [file, existingUrl]);

  const handleFile = (selectedFile) => {
    setInternalError('');
    if (!selectedFile) return;

    if (selectedFile.size > MAX_SIZE_BYTES) {
      setInternalError('File size exceeds 5MB limit. Please select a smaller file.');
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    const name = selectedFile.name.toLowerCase();
    const hasAllowedExt = name.endsWith('.jpg') || name.endsWith('.jpeg') || name.endsWith('.png') || name.endsWith('.pdf');

    if (!allowedTypes.includes(selectedFile.type) && !hasAllowedExt) {
      setInternalError('Invalid file type. Allowed formats: JPG, PNG, PDF.');
      return;
    }

    if (onChange) {
      onChange(selectedFile);
    }
  };

  const handleInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (disabled) return;
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    setInternalError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (onRemove) {
      onRemove();
    }
  };

  const hasFileOrUrl = Boolean(file || existingUrl);
  const displayError = error || internalError;

  return (
    <div className="document-upload-container mb-3">
      {label && (
        <label className="form-label fw-semibold text-secondary d-flex justify-content-between align-items-center mb-1" style={{ fontSize: '0.85rem' }}>
          <span>
            {label} {required && <span className="text-danger">*</span>}
          </span>
          {file && (
            <span className="badge bg-light text-muted border" style={{ fontSize: '0.72rem' }}>
              {(file.size / (1024 * 1024)).toFixed(2)} MB
            </span>
          )}
        </label>
      )}

      {hasFileOrUrl ? (
        <div
          className="p-3 rounded-3 border d-flex align-items-center justify-content-between position-relative bg-white shadow-sm"
          style={{ borderColor: displayError ? '#DC3545' : '#D1D5DB' }}
        >
          <div className="d-flex align-items-center gap-3 overflow-hidden">
            {/* Preview thumbnail or PDF icon */}
            <div
              className="rounded-2 d-flex align-items-center justify-content-center overflow-hidden flex-shrink-0"
              style={{
                width: '64px',
                height: '64px',
                backgroundColor: isPdf ? '#FEE2E2' : '#F1F5F9',
                border: '1px solid #E2E8F0',
              }}
            >
              {isPdf ? (
                <div className="text-center">
                  <FileText size={24} className="text-danger" />
                  <div className="fw-bold text-danger" style={{ fontSize: '9px', letterSpacing: '0.5px' }}>PDF</div>
                </div>
              ) : localPreview ? (
                <img
                  src={localPreview}
                  alt={label || 'Document'}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <ImageIcon size={24} className="text-secondary" />
              )}
            </div>

            {/* Document Info */}
            <div className="text-truncate">
              <div className="fw-semibold text-dark text-truncate" style={{ fontSize: '0.875rem' }}>
                {file ? file.name : (existingUrl ? existingUrl.split('/').pop() : 'Uploaded Document')}
              </div>
              <div className="text-muted small" style={{ fontSize: '0.75rem' }}>
                {isPdf ? 'PDF Document' : 'Image File'} • Ready
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="d-flex align-items-center gap-2 flex-shrink-0 ms-2">
            {!disabled && (
              <button
                type="button"
                onClick={handleRemove}
                className="btn btn-sm btn-outline-danger d-inline-flex align-items-center gap-1 rounded-2 px-2.5 py-1"
                style={{ fontSize: '0.78rem' }}
                title="Remove file"
              >
                <X size={13} className="me-1" />
                <span className="d-none d-sm-inline">Remove</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => !disabled && fileInputRef.current?.click()}
          className={`p-3 text-center rounded-3 border-2 border-dashed ${disabled ? 'bg-light' : 'bg-white'}`}
          style={{
            borderColor: displayError ? '#DC3545' : (dragActive ? '#235665' : '#CBD5E1'),
            backgroundColor: dragActive ? '#F0F9FA' : (disabled ? '#F8FAFC' : '#FFFFFF'),
            cursor: disabled ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          <div className="mb-2 d-flex justify-content-center">
            {dragActive ? <UploadCloud size={28} style={{ color: '#235665' }} /> : <Paperclip size={26} className="text-muted" />}
          </div>
          <div className="fw-semibold text-dark" style={{ fontSize: '0.85rem' }}>
            Click to upload or drag & drop
          </div>
          <div className="text-muted small" style={{ fontSize: '0.74rem' }}>
            JPEG, PNG or PDF (Max 5MB)
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        id={id}
        type="file"
        accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
        className="d-none"
        onChange={handleInputChange}
        disabled={disabled}
      />

      {helperText && !displayError && (
        <div className="form-text text-muted small mt-1" style={{ fontSize: '0.75rem' }}>
          {helperText}
        </div>
      )}

      {displayError && (
        <div className="text-danger small mt-1 fw-medium" style={{ fontSize: '0.75rem' }}>
          <AlertCircle size={13} className="me-1 d-inline text-danger" />{displayError}
        </div>
      )}
    </div>
  );
};

export default DocumentUpload;
