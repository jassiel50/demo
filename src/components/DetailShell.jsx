import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData, fmtBytes, fmtDateTime, initials } from '../context/DataContext.jsx';
import { useToast } from './Toast.jsx';

const FILE_ICONS = {
  'application/pdf': 'picture_as_pdf',
  'image/': 'image',
  'application/vnd.ms-excel': 'table_view',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'table_view',
  'text/': 'description',
};
function fileIcon(tipo) {
  const hit = Object.keys(FILE_ICONS).find((k) => tipo && tipo.startsWith(k));
  return hit ? FILE_ICONS[hit] : 'draft';
}

function AttachmentsTab({ kind, id, archivos }) {
  const { addArchivo, removeArchivo } = useData();
  const toast = useToast();
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFiles = (fileList) => {
    const files = [...fileList];
    if (!files.length) return;
    files.forEach((f) => addArchivo(kind, id, f));
    toast('success', files.length > 1 ? `${files.length} archivos adjuntados.` : 'Archivo adjuntado.');
  };

  return (
    <div>
      <div
        className={'dropzone' + (dragOver ? ' drag' : '')}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
        onClick={() => inputRef.current?.click()}
      >
        <span className="material-symbols-outlined">upload_file</span>
        <p><strong>Arrastra archivos aquí</strong> o haz clic para seleccionar</p>
        <p className="dropzone-hint">Los archivos se guardan solo en esta sesión del navegador.</p>
        <input
          ref={inputRef}
          type="file"
          multiple
          hidden
          onChange={(e) => { handleFiles(e.target.files); e.target.value = ''; }}
        />
      </div>

      {archivos.length === 0 ? (
        <div className="empty-state" style={{ padding: '1.5rem 1rem' }}>
          <span className="material-symbols-outlined">folder_open</span>
          <p>Todavía no hay archivos adjuntos.</p>
        </div>
      ) : (
        <ul className="file-list">
          {archivos.map((a) => (
            <li key={a.id} className="file-row">
              <span className="material-symbols-outlined file-row-icon">{fileIcon(a.tipo)}</span>
              <div className="file-row-info">
                <a href={a.url} target="_blank" rel="noreferrer" className="file-row-name">{a.nombre}</a>
                <span className="file-row-meta">{fmtBytes(a.tamano)} · {fmtDateTime(a.fecha)}</span>
              </div>
              <button type="button" className="action-btn del" title="Quitar" onClick={() => removeArchivo(kind, id, a.id)}>
                <span className="material-symbols-outlined">delete</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function TimelineTab({ kind, id, seguimientos }) {
  const { addSeguimiento, userLabel } = useData();
  const [nota, setNota] = useState('');

  const submit = () => {
    const text = nota.trim();
    if (!text) return;
    addSeguimiento(kind, id, text);
    setNota('');
  };

  const ordered = [...seguimientos].sort((a, b) => b.fecha.localeCompare(a.fecha));

  return (
    <div>
      <div className="note-composer">
        <div className="avatar-chip" style={{ width: '2.1rem', height: '2.1rem', fontSize: '.65rem', flexShrink: 0 }}>
          {initials(userLabel) || 'UD'}
        </div>
        <div style={{ flex: 1 }}>
          <textarea
            placeholder="Agrega una nota de seguimiento…"
            value={nota}
            onChange={(e) => setNota(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) submit(); }}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '.5rem' }}>
            <button type="button" className="btn btn-primary btn-sm" onClick={submit}>
              <span className="material-symbols-outlined">add_comment</span>Agregar nota
            </button>
          </div>
        </div>
      </div>

      {ordered.length === 0 ? (
        <div className="empty-state" style={{ padding: '1.5rem 1rem' }}>
          <span className="material-symbols-outlined">history_toggle_off</span>
          <p>Sin seguimientos registrados todavía.</p>
        </div>
      ) : (
        <ol className="timeline">
          {ordered.map((s) => (
            <li key={s.id} className="timeline-item">
              <div className="timeline-dot" />
              <div className="timeline-content">
                <div className="timeline-head">
                  <span className="timeline-author">{s.autor}</span>
                  <span className="timeline-date">{fmtDateTime(s.fecha)}</span>
                </div>
                <p className="timeline-note">{s.nota}</p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

export default function DetailShell({ backTo, backLabel, avatarLabel, title, subtitle, badges, headerActions, infoLabel = 'Información', infoContent, extraTabs = [], entity }) {
  const navigate = useNavigate();
  const tabs = [
    { key: 'info', label: infoLabel, icon: 'badge', content: infoContent },
    ...extraTabs,
    { key: 'archivos', label: 'Archivos', icon: 'attach_file', count: entity.archivos?.length, content: <AttachmentsTab kind={entity.kind} id={entity.id} archivos={entity.archivos || []} /> },
    { key: 'seguimiento', label: 'Seguimiento', icon: 'history_toggle_off', count: entity.seguimientos?.length, content: <TimelineTab kind={entity.kind} id={entity.id} seguimientos={entity.seguimientos || []} /> },
  ];
  const [active, setActive] = useState('info');
  const activeTab = tabs.find((t) => t.key === active) || tabs[0];

  return (
    <div>
      <button type="button" className="back-link" onClick={() => navigate(backTo)}>
        <span className="material-symbols-outlined">arrow_back</span>{backLabel}
      </button>

      <div className="detail-header">
        <div className="detail-header-left">
          <div className="avatar-chip detail-avatar">{avatarLabel}</div>
          <div>
            <h1 className="page-title" style={{ fontSize: '1.5rem', marginBottom: '.3rem' }}>{title}</h1>
            <p className="page-desc" style={{ marginBottom: '.4rem' }}>{subtitle}</p>
            <div style={{ display: 'flex', gap: '.4rem', flexWrap: 'wrap' }}>{badges}</div>
          </div>
        </div>
        <div className="header-actions">{headerActions}</div>
      </div>

      <div className="tabs-bar">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            className={'tab-btn' + (active === t.key ? ' active' : '')}
            onClick={() => setActive(t.key)}
          >
            <span className="material-symbols-outlined">{t.icon}</span>
            {t.label}
            {!!t.count && <span className="tab-count">{t.count}</span>}
          </button>
        ))}
      </div>

      <div className="tab-panel">{activeTab.content}</div>
    </div>
  );
}
