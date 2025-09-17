import React, { useState, useRef, useCallback } from 'react';
import { useConversationStore } from '../../state/conversationStore';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Send, Paperclip, X, Image, FileText } from 'lucide-react';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { mockMessages } from '../../data/mockData';

export const Composer: React.FC = () => {
  const [message, setMessage] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const { selectedConversationId } = useConversationStore();

  const handleSendMessage = useCallback(() => {
    if (!selectedConversationId) return;
    
    const content = message.trim();
    if (!content && files.length === 0) return;

    setIsSending(true);

    // Simulate sending message
    setTimeout(() => {
      // Add message to mock data
      const newMessage = {
        id: Date.now(),
        content,
        inbox_id: 1,
        conversation_id: selectedConversationId,
        message_type: 1, // outgoing
        created_at: Math.floor(Date.now() / 1000),
        updated_at: Math.floor(Date.now() / 1000),
        private: isPrivate,
        status: 'sent' as const,
        source_id: `msg_${selectedConversationId}_${Date.now()}`,
        content_type: isPrivate ? 'note' as const : 'text' as const,
        content_attributes: {},
        sender_type: 'agent' as const,
        sender_id: 1,
        external_source_ids: {},
        additional_attributes: {},
        processed_message_content: null,
        sentiment: {},
        conversation: {} as any,
        attachments: files.length > 0 ? files.map((file, index) => ({
          id: Date.now() + index,
          file_type: file.type.startsWith('image/') ? 'image' : 'file',
          extension: file.name.split('.').pop() || '',
          data_url: URL.createObjectURL(file),
          thumb_url: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
          file_url: URL.createObjectURL(file),
          file_size: file.size,
          fallback_title: file.name,
          coordinates_lat: null,
          coordinates_long: null,
        })) : [],
      };

      if (!mockMessages[selectedConversationId]) {
        mockMessages[selectedConversationId] = [];
      }
      mockMessages[selectedConversationId].push(newMessage);

      setMessage('');
      setFiles([]);
      setIsPrivate(false);
      setIsSending(false);
      
      // Auto-resize textarea
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }, 500);
  }, [selectedConversationId, message, files, isPrivate]);

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
              placeholder={isPrivate ? "Digite sua nota privada..." : "Digite sua mensagem... (Enter para enviar, Shift+Enter para nova linha)"}
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
              accept="image/*,.pdf,.doc,.docx,.txt,.csv,.xlsx"
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