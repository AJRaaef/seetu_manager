import React from 'react';
import { FileText, Image as ImageIcon, Download, ExternalLink, ShieldCheck } from 'lucide-react';
import { getVerificationFileUrl } from '../api/verificationApi';

const DocumentPreview = ({
  show,
  onClose,
  title = 'Document Preview',
  fileUrl,
}) => {
  if (!show || !fileUrl) return null;

  const fullUrl = getVerificationFileUrl(fileUrl);
  const isPdf = fileUrl.toLowerCase().endsWith('.pdf');
  const filename = fileUrl.split('/').pop() || 'document';

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = fullUrl;
    link.download = filename;
    link.target = '_blank';
    link.rel = 'noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      className="modal show d-block"
      style={{
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(4px)',
        zIndex: 1060,
      }}
      onClick={onClose}
    >
      <div
        className="modal-dialog modal-dialog-centered modal-xl"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '900px' }}
      >
        <div className="modal-content border-0 shadow-2xl" style={{ borderRadius: '14px', overflow: 'hidden' }}>
          {/* Header */}
          <div className="modal-header text-white px-4 py-3" style={{ backgroundColor: '#235665' }}>
            <div className="d-flex align-items-center gap-2">
              <span className="d-flex align-items-center">{isPdf ? <FileText size={20} className="text-white" /> : <ImageIcon size={20} className="text-white" />}</span>
              <div>
                <h6 className="modal-title fw-bold mb-0 text-white" style={{ fontSize: '1rem' }}>
                  {title}
                </h6>
                <small className="text-white-50" style={{ fontSize: '0.75rem' }}>
                  {filename}
                </small>
              </div>
            </div>
            <div className="d-flex align-items-center gap-2">
              <button
                type="button"
                onClick={handleDownload}
                className="btn btn-sm btn-light fw-semibold d-inline-flex align-items-center gap-1.5 px-3 py-1.5 shadow-sm"
                style={{ fontSize: '0.8rem', color: '#235665' }}
              >
                <Download size={14} />
                <span>Download</span>
              </button>
              <a
                href={fullUrl}
                target="_blank"
                rel="noreferrer"
                className="btn btn-sm btn-outline-light fw-semibold d-inline-flex align-items-center gap-1 px-2.5 py-1.5"
                style={{ fontSize: '0.8rem' }}
                title="Open in new window"
              >
                <ExternalLink size={13} />
                <span>New Tab</span>
              </a>
              <button
                type="button"
                className="btn-close btn-close-white ms-2"
                onClick={onClose}
                aria-label="Close"
              />
            </div>
          </div>

          {/* Body */}
          <div
            className="modal-body p-0 d-flex align-items-center justify-content-center bg-dark"
            style={{ minHeight: '480px', maxHeight: '80vh', overflow: 'auto' }}
          >
            {isPdf ? (
              <div className="w-100" style={{ height: '70vh' }}>
                <iframe
                  src={`${fullUrl}#toolbar=1`}
                  title={title}
                  width="100%"
                  height="100%"
                  style={{ border: 'none' }}
                />
              </div>
            ) : (
              <div className="p-3 text-center w-100">
                <img
                  src={fullUrl}
                  alt={title}
                  className="img-fluid rounded shadow"
                  style={{
                    maxHeight: '75vh',
                    maxWidth: '100%',
                    objectFit: 'contain',
                    backgroundColor: '#1E293B',
                  }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.style.display = 'none';
                    const parent = e.target.parentElement;
                    if (parent) {
                      const msg = document.createElement('div');
                      msg.className = 'text-white p-4 text-center';
                      msg.innerHTML = '<p>Unable to render inline image preview.</p><a href="' + fullUrl + '" target="_blank" class="btn btn-sm btn-outline-light">Download / Open Externally</a>';
                      parent.appendChild(msg);
                    }
                  }}
                />
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="modal-footer bg-light px-4 py-2.5 d-flex justify-content-between align-items-center">
            <span className="text-muted small" style={{ fontSize: '0.78rem' }}>
              <ShieldCheck size={14} className="d-inline me-1 text-muted" /> Official Verification Evidence • Identity Integrity System
            </span>
            <button
              type="button"
              className="btn btn-sm btn-secondary px-3 py-1.5"
              onClick={onClose}
              style={{ borderRadius: '6px' }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentPreview;
