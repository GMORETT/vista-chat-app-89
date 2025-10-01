import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useConversationStore } from '../../state/stores/conversationStore';
import { useMessages } from '../../hooks/useMessages';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Send, Paperclip, X, Image, FileText, Mic } from 'lucide-react';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';

export const Composer: React.FC = () => {
  const [message, setMessage] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [shouldRestoreFocus, setShouldRestoreFocus] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const { selectedConversationId, replyToMessage, setReplyToMessage } = useConversationStore();
  const { sendMessage, sendFiles, isSending } = useMessages(selectedConversationId);

  // Restore focus after message is cleared
  useEffect(() => {
    if (shouldRestoreFocus && message === '' && textareaRef.current) {
      textareaRef.current.focus();
      setShouldRestoreFocus(false);
    }
  }, [message, shouldRestoreFocus]);

  const handleSendMessage = useCallback(async () => {
    if (!selectedConversationId) return;
    
    const content = message.trim();
    if (!content && files.length === 0) return;

    try {
      if (files.length > 0) {
        // Send files with optional message
        sendFiles(files, content || undefined, replyToMessage?.id);
      } else {
        // Send text message
        sendMessage(content, isPrivate, replyToMessage?.id);
      }

      // Set flag to restore focus after clearing message
      setShouldRestoreFocus(true);
      
      // Clear form on success
      setMessage('');
      setFiles([]);
      setIsPrivate(false);
      setReplyToMessage(null);
      
      // Auto-resize textarea
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      // Could add toast notification here
    }
  }, [selectedConversationId, message, files, isPrivate, sendMessage, sendFiles]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !isSending) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Auto-resize textarea
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    
    // Auto-resize
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
  };

  const handleFileSelect = useCallback((selectedFiles: FileList | File[]) => {
    const fileArray = Array.from(selectedFiles);
    const validFiles = fileArray.filter(file => file.size <= 20 * 1024 * 1024); // 20MB limit
    
    if (files.length + validFiles.length > 10) {
      alert('Máximo de 10 arquivos por mensagem');
      return;
    }
    
    setFiles(prev => [...prev, ...validFiles]);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [files.length]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFileSelect(e.target.files);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files) {
      handleFileSelect(e.dataTransfer.files);
    }
  }, [handleFileSelect]);

  if (!selectedConversationId) {
    return (
      <div className="p-4 border-t border-border bg-card">
        <div className="text-center text-muted text-sm">
          Selecione uma conversa para enviar mensagens
        </div>
      </div>
    );
  }

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <Image className="h-4 w-4" />;
    if (file.type.startsWith('audio/')) return <Mic className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div 
      className={`
        relative border-t border-border bg-card transition-all duration-200
        ${isDragging ? 'bg-primary/5 border-primary' : ''}
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drag overlay */}
      {isDragging && (
        <div className="absolute inset-0 bg-primary/10 border-2 border-dashed border-primary rounded-lg flex items-center justify-center z-10">
          <div className="text-center">
            <div className="text-primary text-2xl mb-2">📁</div>
            <div className="text-sm font-heading text-primary">Solte os arquivos aqui</div>
            <div className="text-xs text-muted-foreground">Máximo 10 arquivos, 20MB cada</div>
          </div>
        </div>
      )}

      <div className="p-4">
        {/* Reply preview */}
        {replyToMessage && (
          <div className="mb-4 bg-accent/20 border border-border rounded-lg p-3">
            <div className="flex items-start justify-between mb-2">
              <div className="text-xs font-medium text-muted-foreground">
                Respondendo a {replyToMessage.sender?.name || (replyToMessage.message_type === 1 ? 'Você' : 'Cliente')}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setReplyToMessage(null)}
                className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
            <div className="text-sm text-foreground/80 truncate border-l-2 border-primary pl-3">
              {replyToMessage.content || 'Arquivo enviado'}
            </div>
          </div>
        )}

        {/* File attachments preview */}
        {files.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-3">
              <Paperclip className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-heading text-foreground">
                Anexos ({files.length}/10)
              </span>
            </div>
            <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
              {files.map((file, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between bg-accent/10 rounded-lg p-3 border border-border"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="text-muted-foreground">
                      {getFileIcon(file)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-foreground truncate">
                        {file.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatFileSize(file.size)}
                      </div>
                    </div>
                    {file.type.startsWith('image/') && (
                      <Badge variant="outline" className="text-xs">
                        Imagem
                      </Badge>
                    )}
                    {file.type.startsWith('audio/') && (
                      <Badge variant="outline" className="text-xs">
                        Áudio
                      </Badge>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Private message toggle */}
        <div className="flex items-center space-x-3 mb-4">
          <Switch
            id="private-mode"
            checked={isPrivate}
            onCheckedChange={setIsPrivate}
            disabled={isSending}
          />
          <Label htmlFor="private-mode" className="text-sm text-muted-foreground">
            {isPrivate ? '🔒 Nota privada (não visível para o cliente)' : 'Mensagem pública'}
          </Label>
        </div>

        {/* Message input */}
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <Textarea
              ref={textareaRef}
              placeholder={isPrivate ? "Digite sua nota privada..." : "Digite sua mensagem..."}
              value={message}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyPress}
              disabled={isSending}
              className="min-h-[44px] max-h-[120px] resize-none transition-all duration-200"
              rows={1}
            />
          </div>
          
          {/* Action buttons */}
          <div className="flex gap-2">
            {/* File attachment button */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleInputChange}
              className="hidden"
              accept="image/*,audio/*,.pdf,.doc,.docx,.txt,.csv,.xlsx,.mp3,.wav,.ogg,.m4a"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isSending || files.length >= 10}
              className="h-11 w-11 p-0"
              title={files.length >= 10 ? "Máximo de 10 arquivos" : "Anexar arquivo"}
            >
              <Paperclip className="h-4 w-4" />
            </Button>

            {/* Send button */}
            <Button
              onClick={handleSendMessage}
              disabled={isSending || (!message.trim() && files.length === 0)}
              className="h-11 w-11 p-0"
              title="Enviar mensagem"
            >
              {isSending ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground"></div>
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Status indicator */}
        <div className="flex items-center justify-between mt-3">
          <div className="text-xs text-muted-foreground">
            {message.length > 0 && (
              <span>{message.length} caracteres</span>
            )}
          </div>
          {isSending && (
            <div className="text-xs text-primary flex items-center gap-1">
              <div className="animate-pulse">Enviando mensagem...</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};