import React, { createContext, useCallback, useContext, useRef, useState } from 'react';

const ToastContext = createContext(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast debe usarse dentro de <ToastProvider>');
  return ctx;
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const seq = useRef(0);

  const toast = useCallback((type, message) => {
    const id = ++seq.current;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  }, []);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div id="toast-container">
        {toasts.map((t) => (
          <div key={t.id} className={'toast ' + (t.type === 'error' ? 'error' : 'success')}>
            <span className="material-symbols-outlined">
              {t.type === 'error' ? 'error' : t.type === 'info' ? 'info' : 'check_circle'}
            </span>
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
