import React from 'react';
import { FileIcon, CheckCircle, Download, Edit2, Archive, Undo } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import styles from './DocumentList.module.css';

const DocumentList = ({ 
  documents = [], 
  selectedDocs = [], 
  onSelectionChange,
  onEditDocument,
  onUpdateDocument,
  onArchiveDocument,
  onDeleteDocument,
  documentStatus        
}) => {
  return (
    <div className={styles.documentList}>
      <table>
        <thead>
          <tr>
            <th>
              <input 
                type="checkbox"
                checked={selectedDocs.length === documents.length}
                onChange={(e) => {
                  onSelectionChange(e.target.checked ? documents.map(d => d._id) : []);
                }}
              />
            </th>
            <th>Name</th>
            <th>Tags</th>
            <th>Upload Date</th>
            <th>Size</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {documents.map(doc => (
            <tr key={doc._id} className={selectedDocs.includes(doc._id) ? styles.selected : ''}>
              <td>
                <input 
                  type="checkbox"
                  checked={selectedDocs.includes(doc._id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      onSelectionChange([...selectedDocs, doc._id]);
                    } else {
                      onSelectionChange(selectedDocs.filter(id => id !== doc._id));
                    }
                  }}
                />
              </td>
              <td className={styles.nameCell}>
                <div className={styles.fileInfo}>
                  {doc.mimeType.startsWith('image/') ? (
                    <img src={doc._url} alt={doc.name} className={styles.preview} />
                  ) : (
                    <FileIcon className={styles.icon} />
                  )}
                  <span>{doc.name}</span>
                </div>
              </td>
              <td>
                <div className={styles.tags}>
                  {doc.tags.map(tag => (
                    <span key={tag} className={styles.tag}>{tag}</span>
                  ))}
                </div>
              </td>
              <td>{formatDistanceToNow(new Date(doc.uploadDate), { addSuffix: true })}</td>
              <td>{(doc.size / 1024 / 1024).toFixed(2)} MB</td>
              <td>
                <div className={styles.actions}>
                  <button 
                    onClick={() => window.open(doc._url)}
                    className={styles.actionBtn}
                    title="Download"
                  >
                    <Download className={styles.icon} />
                  </button>
                  <button 
                    onClick={() => onEditDocument(doc)}
                    className={styles.actionBtn}
                    title="Edit"
                  >
                    <Edit2 className={styles.icon} />
                  </button>
                  <button 
                    onClick={() => onArchiveDocument(doc._id)}
                    className={styles.actionBtn}
                    title={documentStatus === 'ARCHIVED' ? 'Restore' : 'Archive'}
                  >
                    {documentStatus === 'ARCHIVED' ? (
                      <Undo className={styles.icon} />
                    ) : (
                      <Archive className={styles.icon} />
                    )}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DocumentList;