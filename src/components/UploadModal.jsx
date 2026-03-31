import React, { useState, useRef } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { CATEGORIES } from '../constants/categories';
import { API_BASE } from '../utils/api';

const allPossibleTags = Object.values(CATEGORIES).flat();

const UploadModal = ({ onClose, onSuccess }) => {
  const { t } = useLanguage();
  const [title, setTitle] = useState('');
  const [categoryL1, setCategoryL1] = useState('');
  const [categoryL2, setCategoryL2] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [file, setFile] = useState(null);
  const [sourceFile, setSourceFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [fileSizeError, setFileSizeError] = useState(false);
  const fileInputRef = useRef(null);
  const xhrRef = useRef(null);

  const toggleTag = (tag) => {
    // Bidirectional binding: if we deselect the current L2 category tag, clear the dropdown
    if (tag === categoryL2) {
      setCategoryL2('');
    }
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  // Sync categoryL2 with tags (The "Binding" state)
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
      setIsUploading(false);
      setUploadProgress(0);
      setError(t('uploadCancelled'));
    }
  };

  const handleUpload = (e) => {
    e.preventDefault();
    if (!title.trim() || !file || fileSizeError) {
      return;
    }

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
    if (sourceFile) {
      formData.append('source_file', sourceFile);
    }

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
      if (xhr.status >= 200 && xhr.status < 300) {
        onSuccess && onSuccess();
        onClose();
      } else {
        try {
          const response = JSON.parse(xhr.responseText);
          setError(response.detail || t('errUploadFail'));
        } catch (e) {
          setError(t('errUploadFail'));
        } finally {
          setIsUploading(false);
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
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1100 }}>
      <div 
        className="modal-content" 
        onClick={e => e.stopPropagation()}
        style={{ width: '400px', maxWidth: '90%', padding: '24px' }}
      >
        <button className="modal-close" onClick={onClose}>
          <X size={24} />
        </button>
        
        <h2 style={{ marginBottom: '24px', color: 'var(--text-primary)' }}>{t('uploadVideo')}</h2>
        
        {(error || fileSizeError) && <div className="error-message" style={{ marginBottom: '16px', color: '#EF4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '12px', borderRadius: '8px', fontSize: '14px' }}>{error || fileSizeError}</div>}
        
        <form onSubmit={handleUpload}>
          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>{t('title')}</label>
            <input 
              type="text" 
              className="form-input" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('titlePlaceholder')}
              disabled={isUploading}
            />
          </div>
          
          <div className="form-group" style={{ marginBottom: '20px', display: 'flex', gap: '16px' }}>
            <div style={{ flex: 1 }}>
              <label className="form-label" style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>{t('labelL1')}</label>
              <select 
                className="form-input" 
                value={categoryL1}
                onChange={(e) => {
                  setCategoryL1(e.target.value);
                  setCategoryL2('');
                }}
                disabled={isUploading}
                style={{ width: '100%', appearance: 'auto', WebkitAppearance: 'auto', backgroundColor: 'var(--bg-primary)' }}
              >
                <option value="">{t('placeholderL1')}</option>
                {Object.keys(CATEGORIES).map(cat => (
                  <option key={cat} value={cat}>{t(cat) || cat}</option>
                ))}
              </select>
            </div>
            
            <div style={{ flex: 1 }}>
              <label className="form-label" style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>{t('labelL2')}</label>
              <select 
                className="form-input" 
                value={categoryL2}
                onChange={(e) => setCategoryL2(e.target.value)}
                disabled={isUploading || !categoryL1}
                style={{ width: '100%', appearance: 'auto', WebkitAppearance: 'auto', backgroundColor: 'var(--bg-primary)' }}
              >
                <option value="">{t('placeholderL2')}</option>
                {categoryL1 && CATEGORIES[categoryL1].map(sub => (
                  <option key={sub} value={sub}>{t(sub) || sub}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="form-label" style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>{t('labelTags')}</label>
            <div className="tag-cloud" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', maxHeight: '120px', overflowY: 'auto', padding: '8px', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              {allPossibleTags.map(tag => (
                <button 
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  disabled={isUploading}
                  style={{
                    padding: '4px 12px',
                    borderRadius: '16px',
                    border: selectedTags.includes(tag) ? '1px solid #cbd5e1' : '1px solid var(--border-color)',
                    background: selectedTags.includes(tag) ? '#e2e8f0' : 'transparent',
                    color: selectedTags.includes(tag) ? 'var(--text-primary)' : 'var(--text-secondary)',
                    fontSize: '12px',
                    cursor: isUploading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease',
                    fontWeight: selectedTags.includes(tag) ? '500' : '400'
                  }}
                >
                  {t(tag) || tag}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '32px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>{t('videoFile')}</label>
            <div 
              className="dropzone" 
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: '2px dashed var(--border-color)',
                borderRadius: '8px',
                padding: '24px 32px',
                textAlign: 'center',
                cursor: 'pointer',
                background: 'var(--bg-secondary)',
                transition: 'all 0.2s ease',
              }}
            >
              <input 
                type="file" 
                accept="video/mp4" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                style={{ display: 'none' }} 
                disabled={isUploading}
              />
              <Upload size={24} style={{ color: 'var(--primary-color)', margin: '0 auto 8px auto' }} />
              <div style={{ color: 'var(--text-primary)', fontWeight: '500', fontSize: '14px' }}>
                {file ? file.name : t("selectFileHint")}
              </div>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '32px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>{t('manimSource')}</label>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <input 
                type="file" 
                accept=".py" 
                onChange={handleSourceChange}
                style={{ display: 'none' }}
                id="source-upload"
                disabled={isUploading}
              />
              <label 
                htmlFor="source-upload"
                className="btn-ghost"
                style={{ 
                  cursor: 'pointer', 
                  flex: '0 0 auto', 
                  padding: '8px 16px', 
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              >
                {t('sourceFileHint')}
              </label>
              <span style={{ fontSize: '14px', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {sourceFile ? sourceFile.name : ''}
              </span>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              type="submit" 
              className="btn-primary" 
              style={{ 
                flex: isUploading ? '2' : '1', 
                padding: '12px', 
                fontSize: '16px', 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                gap: '8px',
                position: 'relative',
                overflow: 'hidden',
                opacity: (fileSizeError || !title || !file) ? 0.6 : 1,
                cursor: (fileSizeError || !title || !file) ? 'not-allowed' : 'pointer'
              }}
              disabled={isUploading || fileSizeError || !title || !file}
            >
              {isUploading ? (
                <span style={{ display: 'flex', alignItems: 'center', zIndex: 2 }}>
                  <Loader2 size={20} className="spinning" style={{ marginRight: '8px' }} /> 
                  {uploadProgress}% {t('btnUploading')}
                </span>
              ) : (
                t('btnUpload')
              )}
              
              {isUploading && (
                <div 
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    height: '100%',
                    width: `${uploadProgress}%`,
                    background: 'rgba(255, 255, 255, 0.2)',
                    transition: 'width 0.3s ease-out',
                    zIndex: 1
                  }}
                />
              )}
            </button>

            {isUploading && (
              <button 
                type="button" 
                className="btn-ghost" 
                onClick={handleCancelUpload}
                style={{ 
                  color: '#ef4444', 
                  borderColor: '#fecaca',
                  padding: '12px 24px',
                  borderRadius: '12px',
                  border: '1px solid #fecaca'
                }}
              >
                {t('btnCancel')}
              </button>
            )}
          </div>

          {/* Detailed progress bar below button */}
          {isUploading && (
            <div style={{ marginTop: '16px' }}>
              <div style={{ 
                height: '6px', 
                width: '100%', 
                background: 'var(--bg-tertiary)', 
                borderRadius: '3px',
                overflow: 'hidden',
                border: '1px solid var(--border-color)'
              }}>
                <div style={{ 
                  height: '100%', 
                  width: `${uploadProgress}%`, 
                  background: 'var(--accent-primary)',
                  boxShadow: '0 0 10px var(--accent-primary)',
                  transition: 'width 0.3s ease-out'
                }} />
              </div>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                marginTop: '8px', 
                fontSize: '12px', 
                color: 'var(--text-secondary)' 
              }}>
                <span>{uploadProgress < 100 ? t('btnUploading') : 'Processing...'}</span>
                <span>{uploadProgress}%</span>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default UploadModal;
