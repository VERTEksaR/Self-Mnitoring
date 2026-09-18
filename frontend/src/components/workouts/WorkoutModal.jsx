import {useEffect} from "react";
import {X} from "lucide-react";

export function WkModal({ open, title, onClose, children, footer, width = 420 }) {
    useEffect(() => {
        const fn = e => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', fn);
        return () => document.removeEventListener('keydown', fn);
    }, [onClose]);
    if (!open) return null;
    return (
        <div className="overlay" onClick={onClose}>
            <div className="modal" style={{ width, maxWidth: '95vw' }} onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <span className="modal-title">{title}</span>
                    <button className="btn btn-ghost btn-icon btn-sm" onClick={onClose}><X size={16} /></button>
                </div>
                <div className="modal-body">{children}</div>
                {footer && <div className="modal-actions">{footer}</div>}
            </div>
        </div>
    );
}