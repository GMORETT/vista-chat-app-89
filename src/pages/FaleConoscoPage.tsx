import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Send, Bot } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'sol';
  timestamp: Date;
}

export const FaleConoscoPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Olá! Eu sou a SOL, sua consultora e assistente de suporte. Como posso ajudá-lo hoje?',
      sender: 'sol',
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate SOL's response after a delay
    setTimeout(() => {
      const solResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: getSolResponse(inputMessage),
        sender: 'sol',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, solResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const getSolResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase();
    
    if (message.includes('olá') || message.includes('oi') || message.includes('bom dia') || message.includes('boa tarde')) {
      return 'Olá! É um prazer falar com você. Em que posso ajudá-lo hoje?';
    }
    
    if (message.includes('senha') || message.includes('login')) {
      return 'Para questões relacionadas a senha ou login, posso te ajudar com o processo de recuperação. Você gostaria que eu te orientasse sobre como redefinir sua senha?';
    }
    
    if (message.includes('usuário') || message.includes('usuario') || message.includes('conta')) {
      return 'Para gerenciar usuários e contas, você precisa ter permissões de administrador. Posso te explicar como adicionar ou editar usuários no sistema.';
    }
    
    if (message.includes('integração') || message.includes('whatsapp') || message.includes('instagram')) {
      return 'Oferecemos várias integrações, incluindo WhatsApp, Instagram e Facebook. Posso te explicar como configurar essas integrações ou te conectar com nossa equipe técnica.';
    }
    
    if (message.includes('relatório') || message.includes('relatorio') || message.includes('exportar')) {
      return 'Para exportar relatórios, vá até a seção Dashboard > Relatórios e escolha o formato desejado. Posso te guiar através do processo se precisar.';
    }
    
    if (message.includes('ajuda') || message.includes('suporte')) {
      return 'Estou aqui para ajudar! Posso te auxiliar com questões sobre o sistema, configurações, integração ou qualquer dúvida que você tenha. O que especificamente você precisa?';
    }
    
    return 'Entendi sua mensagem. Nossa equipe de suporte pode te ajudar melhor com isso. Você gostaria que eu transferisse seu atendimento para um especialista ou posso tentar esclarecer alguma dúvida específica?';
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="h-full flex flex-col p-4">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-foreground">Fale com a SOL</h1>
        <p className="text-sm text-muted-foreground">
          Sua consultora e assistente de suporte está aqui para ajudar
        </p>
      </div>

      <Card className="flex-1 flex flex-col">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Bot className="h-5 w-5 text-primary" />
            SOL - Consultora & Suporte
          </CardTitle>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col min-h-0">
          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.sender === 'sol' && (
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      SOL
                    </AvatarFallback>
                  </Avatar>
                )}
                
                <div
                  className={`max-w-[70%] rounded-lg px-3 py-2 ${
                    message.sender === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-foreground'
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                  <p className={`text-xs mt-1 ${
                    message.sender === 'user' 
                      ? 'text-primary-foreground/70' 
                      : 'text-muted-foreground'
                  }`}>
                    {message.timestamp.toLocaleTimeString('pt-BR', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
                
                {message.sender === 'user' && (
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
                      EU
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            
            {isTyping && (
              <div className="flex gap-3 justify-start">
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    SOL
                  </AvatarFallback>
                </Avatar>
                <div className="bg-muted text-foreground rounded-lg px-3 py-2">
                  <p className="text-sm">SOL está digitando...</p>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t pt-4">
            <div className="flex gap-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Digite sua mensagem para SOL..."
                className="flex-1"
                disabled={isTyping}
              />
              <Button 
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isTyping}
                size="sm"
                className="px-3"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Pressione Enter para enviar sua mensagem
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};