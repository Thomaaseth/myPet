import React from 'react';
import { XCircle } from 'lucide-react';
import TagInput from './../TagInput/TagInput';
import { SUGGESTED_TAGS } from '../../../../src/constants/suggestedTags';
import styles from './UploadPreview.module.css';

const UploadPreview = ({ files, onUpdateTags, onRemove, onUpload, isUploading }) => {
    return (
        <div className={styles.uploadPreview}>
            <h3 className={styles.title}>Files to Upload</h3>
            <div className={styles.filesContainer}>
                {files.map((file) => (
                    <div key={file.id} className={styles.fileItem}>
                        <div className={styles.preview}>
                            {file.file.type.startsWith('image/') ? (
                                <img
                                    src={URL.createObjectURL(file.file)}
                                    alt="Preview"
                                    className={styles.previewImage}
                                />
                            ) : (
                                <div className={styles.fileType}>
                                    {file.file.name.split('.').pop().toUpperCase()}
                                </div>
                            )}
                        </div>

                        <div className={styles.fileInfo}>
                            <div className={styles.fileName}>{file.file.name}</div>
                            <div className={styles.fileSize}>
                                {(file.file.size / 1024 / 1024).toFixed(2)} MB
                            </div>
                        </div>

                        <div className={styles.tagsContainer}>
                            <TagInput
                                value={file.tags}
                                onChange={(tags) => onUpdateTags(file.id, tags)}
                                suggestions={SUGGESTED_TAGS}
                            />
                        </div>

                        <div className={styles.status}>
                            {file.status === 'uploading' ? (
                                <div className={styles.progressBar}>
                                    <div 
                                        className={styles.progress} 
                                        style={{ width: `${file.progress}%` }} 
                                    />
                                </div>
                            ) : (
                                <span className={styles.statusText}>{file.status}</span>
                            )}
                        </div>

                        <button
                            onClick={() => onRemove(file.id)}
                            className={styles.removeButton}
                        >
                            <XCircle />
                        </button>
                    </div>
                ))}
            </div>
            <div className={styles.uploadActions}>
                <button
                    onClick={onUpload}
                    disabled={isUploading || files.length === 0}
                    className={styles.uploadButton}
                >
                    {isUploading ? 'Uploading...' : `Upload ${files.length} file${files.length !== 1 ? 's' : ''}`}
                </button>
            </div>
        </div>
    );
};

export default UploadPreview;