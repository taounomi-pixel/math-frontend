import React, { useState, useRef } from 'react';
import { Upload, X, FileText, ChevronDown, CheckCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { CATEGORIES } from '../constants/categories';
import { API_BASE } from '../utils/api';
import GeometricLoader from './GeometricLoader';

import { motion } from 'framer-motion';

const allPossibleTags = Object.values(CATEGORIES).flat();

const FaceIdCheckmark = ({ size = 24, color = "currentColor", style }) => (
  <div style={{ width: size, height: size, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, ...style }}>
    <motion.svg 
      viewBox="0 0 50 50" 
      style={{ width: '100%', height: '100%', position: 'absolute' }}
      initial={{ rotate: -90 }}
      animate={{ rotate: 0 }}
      transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
    >
      <motion.circle
        cx="25" cy="25" r="22"
        fill="none"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      />
    </motion.svg>
    <motion.svg 
      viewBox="0 0 50 50" 
      style={{ width: '100%', height: '100%', position: 'absolute' }}
    >
      <motion.path
        fill="none"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 25l8 8 14-14"
        initial={{ pathLength: 0, scale: 0.8, opacity: 0 }}
        animate={{ pathLength: 1, scale: 1, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.4, type: "spring", stiffness: 300, damping: 20 }}
      />
    </motion.svg>
  </div>
);
const UploadModal = ({ isOpen, onClose, onRefresh, onSuccess }) => {
  const { t, lang } = useLanguage();
  const [title, setTitle] = useState('');
  const [categoryL1, setCategoryL1] = useState('');
  const [categoryL2, setCategoryL2] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [file, setFile] = useState(null);
  const [sourceFile, setSourceFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState('');
  const [fileSizeError, setFileSizeError] = useState('');
  const fileInputRef = useRef(null);
  const xhrRef = useRef(null);
  const [isClosing, setIsClosing] = useState(false);

  const handleLocalClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 280);
  };

  React.useEffect(() => {
    // Lock body scroll when modal opens
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      // Restore body scroll when modal closes
      document.body.style.overflow = originalStyle;
    };
  }, []);

  const toggleTag = (tag) => {
    if (tag === categoryL2) {
      setCategoryL2('');
    }
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  React.useEffect(() => {
    if (categoryL2 && !selectedTags.includes(categoryL2)) {
      setSelectedTags(prev => [...prev, categoryL2]);
    }
  }, [categoryL2]);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected && selected.type === 'video/mp4') {
      if (selected.size > 30 * 1024 * 1024) {
        setFileSizeError(t('errFileTooLarge'));
        setFile(null);
        return;
      }
      setFile(selected);
      setFileSizeError('');
      setError('');
    } else if (selected) {
      setFile(null);
      setFileSizeError('');
      setError(t('errInvalidFile'));
    }
  };

  const handleSourceChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      if (selected.name.endsWith('.py')) {
        setSourceFile(selected);
        setError('');
      } else {
        setSourceFile(null);
        setError(t('errInvalidSource'));
      }
    }
  };

  const handleCancelUpload = () => {
    if (xhrRef.current) {
      xhrRef.current.abort();
      xhrRef.current = null;
    }
    setIsUploading(false);
    setUploadProgress(0);
    setError(t('uploadCancelled'));
  };

  const handleUpload = (e) => {
    e.preventDefault();
    if (!title.trim() || !file || fileSizeError) return;

    const token = localStorage.getItem('access_token');
    if (!token) {
      setError(t('errLoginRequired'));
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setError('');

    const formData = new FormData();
    formData.append('title', title);
    if (categoryL1) formData.append('category_l1', categoryL1);
    if (categoryL2) formData.append('category_l2', categoryL2);
    if (selectedTags.length > 0) formData.append('tags', selectedTags.join(','));
    formData.append('file', file);
    if (sourceFile) formData.append('source_file', sourceFile);

    const xhr = new XMLHttpRequest();
    xhrRef.current = xhr;
    xhr.open('POST', `${API_BASE}/videos`, true);
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        setUploadProgress(percent);
      }
    };

    xhr.onload = () => {
      xhrRef.current = null;
      console.log(`DEBUG: Upload XHR finished. Status: ${xhr.status}`);

      // UI Response based on strict HTTP 200 OK
      if (xhr.status === 200) {
        console.log("鉁?DEBUG: Upload Success (200). Starting 2s synchronization delay...");
        setUploadProgress(100);
        setIsSyncing(true);
        // Do NOT set isUploading to false here, keep it true to disable the button permanently

        // Execute the 2s pause only on absolute success
        setTimeout(() => {
          console.log("DEBUG: Delay finished. Executing final hardware-reload redirect.");
          if (onSuccess) onSuccess();
          if (onClose) onClose();

          if (window.location.pathname === '/') {
            window.location.reload();
          } else {
            window.location.href = "/";
          }
        }, 1200);
      } else {
        console.error(`鉂?DEBUG: Upload Failure (${xhr.status}). Text: ${xhr.responseText}`);
        // Handle 500, 401, 413 or other non-OK status codes
        try {
          if (xhr.status === 500) {
            setError(lang === 'zh' ? '服务器内部错误：R2 存储配置失效 (s3_client is NONE)。请检查 Render 环境变量。' : 'Backend Error: R2 storage disabled (s3_client is NONE). Check Render Env Vars.');
          } else {
            const response = JSON.parse(xhr.responseText);
            setError(response.detail || t('errUploadFail'));
          }
        } catch (e) {
          setError(t('errUploadFail'));
        } finally {
          setIsUploading(false); // Reset allows retry ONLY on failure
          setUploadProgress(0);
          setIsSyncing(false);
        }
      }
    };

    xhr.onerror = () => {
      xhrRef.current = null;
      setError(t('errUploadFail'));
      setIsUploading(false);
    };

    xhr.send(formData);
  };

  return (
    <div className="modal-overlay" onClick={handleLocalClose}>
      <style>{`
        .modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(15, 23, 42, 0.4);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 2000;
        }

        .modal-card {
          background: var(--bg-main);
          width: 520px;
          max-width: 95%;
          max-height: 85vh;
          border-radius: 24px;
          position: relative;
          box-shadow: var(--shadow-glass);
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.5);
          display: flex;
          flex-direction: column;
        }

        .modal-scroll-area {
          overflow-y: auto;
          padding: 40px;
          flex: 1;
          overscroll-behavior: contain;
          background-image: 
            radial-gradient(var(--border-color) 1px, transparent 1px);
          background-size: 32px 32px;
          background-position: center;
        }

        .modal-scroll-area::-webkit-scrollbar {
          width: 8px;
        }
        .modal-scroll-area::-webkit-scrollbar-thumb {
          background: var(--border-color);
          border-radius: 4px;
          border: 2px solid var(--bg-main);
        }
        .modal-scroll-area::-webkit-scrollbar-track {
          background: transparent;
        }

        .form-label {
          display: block;
          font-size: 13px;
          font-weight: 600;
          color: var(--text-secondary);
          margin-bottom: 8px;
          margin-left: 2px;
        }

        .form-input, .form-select {
          width: 100%;
          padding: 12px 16px;
          background: var(--bg-secondary);
          border: 1.5px solid var(--border-color);
          border-radius: 12px;
          font-size: 14px;
          color: var(--text-primary);
          transition: all 0.2s;
          outline: none;
          appearance: none;
          -webkit-appearance: none;
          -moz-appearance: none;
        }
        .form-input:focus, .form-select:focus {
          border-color: var(--accent-primary);
          background: white;
          box-shadow: 0 0 0 4px var(--accent-primary-light);
        }

        .select-wrapper {
          position: relative;
          width: 100%;
        }
        .select-arrow {
          position: absolute;
          right: 12px; top: 50%;
          transform: translateY(-50%);
          pointer-events: none;
          color: var(--text-tertiary);
          z-index: 1;
        }

        .tag-cloud {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          padding: 12px;
          background: var(--bg-secondary);
          border-radius: 14px;
          border: 1.5px solid var(--border-color);
          max-height: 140px;
          overflow-y: auto;
        }
        .tag-item {
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          border: 1.5px solid var(--border-color);
          background: white;
          color: var(--text-secondary);
        }
        .tag-item:hover {
          background: var(--accent-primary-light);
          border-color: var(--accent-primary);
          color: var(--accent-primary);
        }
        .tag-item.active {
          background: var(--accent-primary) !important;
          color: white !important;
          border-color: var(--accent-primary) !important;
          box-shadow: 0 10px 15px -3px rgba(2, 132, 199, 0.3);
        }

        .dropzone-refined {
          border: 2px dashed var(--border-color);
          border-radius: 16px;
          padding: 32px;
          text-align: center;
          cursor: pointer;
          background: rgba(248, 250, 252, 0.5);
          transition: all 0.2s;
        }
        .dropzone-refined:hover {
          border-color: var(--accent-primary);
          background: var(--accent-primary-light);
        }

        .btn-row {
          display: flex;
          gap: 16px;
          margin-top: 32px;
        }
      `}</style>

      <div 
        className={`modal-card ${isClosing ? 'ios-modal-closing' : 'ios-modal-anim'}`} 
        onClick={e => e.stopPropagation()}
      >
        <button 
          className="close-btn-circular" 
          style={{ position: 'absolute', top: '16px', right: '16px' }}
          onClick={handleLocalClose} 
          disabled={isUploading}
        >
          <X size={18} />
        </button>

        <div className="modal-scroll-area">
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '8px' }}>
              {t('uploadVideo')}
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--text-tertiary)' }}>
              Share your mathematical visualization with the community
            </p>
          </div>

          {(error || fileSizeError) && (
            <div style={{
              marginBottom: '24px', padding: '12px 16px',
              borderRadius: '12px', background: '#FEF2F2',
              color: '#B91C1C', fontSize: '14px', fontWeight: '500',
              border: '1px solid #FECACA', display: 'flex', gap: '8px', alignItems: 'center'
            }}>
              <X size={16} /> {error || fileSizeError}
            </div>
          )}

          <form onSubmit={handleUpload}>
            <div style={{ marginBottom: '24px' }}>
              <label className="form-label">{t('title')}</label>
              <input
                type="text"
                className="form-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t('titlePlaceholder')}
                disabled={isUploading}
              />
            </div>

            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
              <div style={{ flex: 1 }}>
                <label className="form-label">{t('labelL1')}</label>
                <div className="select-wrapper">
                  <select
                    className="form-select"
                    value={categoryL1}
                    onChange={(e) => {
                      setCategoryL1(e.target.value);
                      setCategoryL2('');
                    }}
                    disabled={isUploading}
                  >
                    <option value="">{t('placeholderL1')}</option>
                    {Object.keys(CATEGORIES).map(cat => (
                      <option key={cat} value={cat}>{t(cat) || cat}</option>
                    ))}
                  </select>
                  <ChevronDown className="select-arrow" size={16} />
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <label className="form-label">{t('labelL2')}</label>
                <div className="select-wrapper">
                  <select
                    className="form-select"
                    value={categoryL2}
                    onChange={(e) => setCategoryL2(e.target.value)}
                    disabled={isUploading || !categoryL1}
                  >
                    <option value="">{t('placeholderL2')}</option>
                    {categoryL1 && CATEGORIES[categoryL1].map(sub => (
                      <option key={sub} value={sub}>{t(sub) || sub}</option>
                    ))}
                  </select>
                  <ChevronDown className="select-arrow" size={16} />
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label className="form-label">{t('labelTags')}</label>
              <div className="tag-cloud">
                {allPossibleTags.map(tag => {
                  const isActive = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      disabled={isUploading}
                      className={`tag-item ${isActive ? 'active' : ''}`}
                    >
                      {t(tag) || tag}
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '20px', marginBottom: '32px' }}>
              <div style={{ flex: 1 }}>
                <label className="form-label">{t('videoFile')}</label>
                <div className="dropzone-refined" onClick={() => fileInputRef.current?.click()}>
                  <input
                    type="file" accept="video/mp4" ref={fileInputRef}
                    onChange={handleFileChange} style={{ display: 'none' }} disabled={isUploading}
                  />
                  <Upload size={24} style={{ color: 'var(--accent-primary)', margin: '0 auto 12px' }} />
                  <div style={{ fontSize: '13px', fontWeight: '600', color: file ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                    {file ? file.name : t("selectFileHint")}
                  </div>
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <label className="form-label">{t('manimSource')}</label>
                <input type="file" accept=".py" onChange={handleSourceChange} style={{ display: 'none' }} id="src-upload" disabled={isUploading} />
                <label
                  htmlFor="src-upload"
                  className="dropzone-refined"
                  style={{ display: 'block', padding: '32px 16px' }}
                >
                  <FileText size={24} style={{ color: sourceFile ? 'var(--accent-primary)' : 'var(--text-tertiary)', margin: '0 auto 12px' }} />
                  <div style={{ fontSize: '13px', fontWeight: '600', color: sourceFile ? 'var(--text-primary)' : 'var(--text-tertiary)' }}>
                    {sourceFile ? sourceFile.name : t('sourceFileHint')}
                  </div>
                </label>
              </div>
            </div>

            <div className="btn-row">
              <button
                type="button"
                className="btn-outline"
                onClick={onClose}
                disabled={isUploading}
                style={{ flex: 1, padding: '14px', borderRadius: '14px' }}
              >
                {t('btnCancel')}
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={isUploading || fileSizeError || !title || !file}
                style={{
                  flex: 1.5, padding: '14px', borderRadius: '14px',
                  opacity: (fileSizeError || !title || !file) ? 0.6 : 1,
                  cursor: (fileSizeError || !title || !file) ? 'not-allowed' : 'pointer'
                }}
              >
                {isUploading ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                    {isSyncing ? (
                      <FaceIdCheckmark size={20} color="#fff" style={{ marginRight: '12px' }} />
                    ) : (
                      <div style={{ marginRight: '12px', display: 'flex', alignItems: 'center' }}>
                        <GeometricLoader size={20} showText={false} />
                      </div>
                    )}
                    <span>
                      {isSyncing
                        ? (lang === 'zh' ? '上传成功' : 'Upload successful')
                        : (lang === 'zh' ? `正在上传中... ${uploadProgress}%` : `Uploading... ${uploadProgress}%`)
                      }
                    </span>
                  </span>
                ) : (
                  <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                    <Upload size={20} style={{ marginRight: '10px' }} />
                    {t('btnUpload')}
                  </span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UploadModal;
