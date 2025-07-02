import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'md' }) => {
  const [show, setShow] = useState(isOpen);
  const [animate, setAnimate] = useState('in');

  useEffect(() => {
    if (isOpen) {
      setShow(true);
      setAnimate('in');
    } else if (show) {
      setAnimate('out');
      const timer = setTimeout(() => setShow(false), 350);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setAnimate('out');
        setTimeout(() => onClose(), 350);
      }
    };

    if (show) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [show, onClose]);

  if (!show) return null;

  const handleOverlayClose = () => {
    setAnimate('out');
    setTimeout(() => onClose(), 350);
  };

  return (
    <div className="modal-overlay modal-overlay-animate" onClick={handleOverlayClose}>
      <div className={`modal-content modal-${size} futuristic-modal ${animate === 'in' ? 'modal-animate-in' : 'modal-animate-out'}`} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          <button onClick={handleOverlayClose} className="modal-close">
            <X size={20} />
          </button>
        </div>
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;