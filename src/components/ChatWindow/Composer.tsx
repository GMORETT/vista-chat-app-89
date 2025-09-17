import React, { useState, useRef } from 'react';
import { useMessages } from '../../hooks/useMessages';
import { useConversationStore } from '../../state/conversationStore';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Send, Paperclip, Smile } from 'lucide-react';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';

export const Composer: React.FC = () => {
  const [message, setMessage] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { selectedConversationId } = useConversationStore();
  const { sendMessage, sendFiles, isSending } = useMessages(selectedConversationId);

  const handleSendMessage = () => {
    if (!selectedConversationId) return;
    
    const content = message.trim();
    if (!content && files.length === 0) return;

    if (files.length > 0) {
      sendFiles(files, content, isPrivate);
      setFiles([]);
    } else {
      sendMessage({ content, private: isPrivate });
    }
    
    setMessage('');
    setIsPrivate(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    setFiles(prev => [...prev, ...selectedFiles]);
    // Clear the input so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  if (!selectedConversationId) {
    return (
      <div className="p-4 border-t border-border bg-card">
        <div className="text-center text-muted text-sm">
          Selecione uma conversa para enviar mensagens
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 border-t border-border bg-card">
      {/* File attachments preview */}
      {files.length > 0 && (
        <div className="mb-3 space-y-2">
          <div className="text-sm font-medium text-foreground">Anexos:</div>
          <div className="space-y-1">
            {files.map((file, index) => (
              <div key={index} className="flex items-center justify-between bg-accent/10 rounded p-2">
                <span className="text-sm text-foreground truncate">{file.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                  className="h-6 w-6 p-0 text-muted hover:text-danger"
                >
                  ×
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Private message toggle */}
      <div className="flex items-center space-x-2 mb-3">
        <Switch
          id="private-mode"
          checked={isPrivate}
          onCheckedChange={setIsPrivate}
        />
        <Label htmlFor="private-mode" className="text-sm text-muted">
          Nota privada (não visível para o cliente)
        </Label>
      </div>

      {/* Message input */}
      <div className="flex gap-2">
        <div className="flex-1">
          <Textarea
            placeholder={isPrivate ? "Digite sua nota privada..." : "Digite sua mensagem..."}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isSending}
            className="min-h-[80px] resize-none"
          />
        </div>
        
        <div className="flex flex-col gap-2">
          {/* File attachment button */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isSending}
            className="h-10 w-10 p-0"
          >
            <Paperclip className="h-4 w-4" />
          </Button>

          {/* Send button */}
          <Button
            onClick={handleSendMessage}
            disabled={isSending || (!message.trim() && files.length === 0)}
            className="h-10 w-10 p-0"
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
      {isSending && (
        <div className="mt-2 text-xs text-muted">
          Enviando mensagem...
        </div>
      )}
    </div>
  );
};