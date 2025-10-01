import React, { useEffect } from 'react';
import { X, Download, ExternalLink } from 'lucide-react';
import { Button } from '../ui/button';

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  src: string;
  alt: string;
  fileName?: string;
}

export const ImageModal: React.FC<ImageModalProps> = ({
  isOpen,
  onClose,
  src,
  alt,
  fileName
}) => {
  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = src;
    link.download = fileName || 'image';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenInNewTab = () => {
    window.open(src, '_blank');
  };

  return (
    <div 
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      {/* Modal Container */}
      <div className="relative max-w-[90vw] max-h-[90vh] bg-background rounded-lg overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/50 to-transparent p-4 z-10">
          <div className="flex items-center justify-between text-white">
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium truncate">
                {fileName || alt}
              </h3>
            </div>
            <div className="flex items-center gap-2 ml-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDownload}
                className="text-white hover:bg-white/20"
                title="Baixar imagem"
              >
                <Download className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleOpenInNewTab}
                className="text-white hover:bg-white/20"
                title="Abrir em nova aba"
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-white hover:bg-white/20"
                title="Fechar"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Image */}
        <div className="flex items-center justify-center min-h-[200px]">
          <img
            src={src}
            alt={alt}
            className="max-w-full max-h-[85vh] object-contain rounded-lg"
            style={{ maxWidth: '85vw' }}
          />
        </div>

        {/* Footer with controls */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-4">
          <div className="flex items-center justify-center text-white">
            <p className="text-xs opacity-80">
              Clique fora da imagem ou pressione ESC para fechar
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};