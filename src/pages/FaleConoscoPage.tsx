import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { HeadphonesIcon, MessageSquare, Mail, Phone, Clock, MapPin } from 'lucide-react';

export const FaleConoscoPage: React.FC = () => {
  return (
    <div className="h-full overflow-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Fale com a SOL</h1>
        <p className="text-muted-foreground mt-2">
          Entre em contato com nossa equipe de suporte
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HeadphonesIcon className="h-5 w-5" />
              Canais de Atendimento
            </CardTitle>
            <CardDescription>
              Escolha a melhor forma de entrar em contato conosco
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer">
              <MessageSquare className="h-8 w-8 text-primary" />
              <div className="flex-1">
                <h3 className="font-medium">Chat Online</h3>
                <p className="text-sm text-muted-foreground">Resposta imediata durante horário comercial</p>
              </div>
              <Button variant="outline" size="sm">
                Iniciar Chat
              </Button>
            </div>

            <div className="flex items-center gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer">
              <Mail className="h-8 w-8 text-primary" />
              <div className="flex-1">
                <h3 className="font-medium">E-mail</h3>
                <p className="text-sm text-muted-foreground">suporte@solabs.com.br</p>
              </div>
              <Button variant="outline" size="sm">
                Enviar E-mail
              </Button>
            </div>

            <div className="flex items-center gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer">
              <Phone className="h-8 w-8 text-primary" />
              <div className="flex-1">
                <h3 className="font-medium">Telefone</h3>
                <p className="text-sm text-muted-foreground">(11) 3333-4444</p>
              </div>
              <Button variant="outline" size="sm">
                Ligar Agora
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Horários de Atendimento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="font-medium">Segunda a Sexta</span>
                <span className="text-muted-foreground">8:00 - 18:00</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Sábado</span>
                <span className="text-muted-foreground">9:00 - 14:00</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Domingo</span>
                <span className="text-muted-foreground">Fechado</span>
              </div>
            </div>

            <div className="mt-6 p-4 bg-accent/50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="font-medium">Nosso Endereço</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Rua das Flores, 123<br />
                Sala 456 - Centro<br />
                São Paulo, SP - CEP 01234-567
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Perguntas Frequentes</CardTitle>
          <CardDescription>
            Respostas para as dúvidas mais comuns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border-b pb-4">
              <h4 className="font-medium mb-2">Como posso alterar minha senha?</h4>
              <p className="text-sm text-muted-foreground">
                Vá para Configurações {'>'} Segurança {'>'} Alterar Senha. Você receberá um e-mail de confirmação.
              </p>
            </div>

            <div className="border-b pb-4">
              <h4 className="font-medium mb-2">Como adicionar novos usuários?</h4>
              <p className="text-sm text-muted-foreground">
                Apenas administradores podem adicionar usuários. Acesse o painel Admin {'>'} Usuários {'>'} Novo Usuário.
              </p>
            </div>

            <div className="border-b pb-4">
              <h4 className="font-medium mb-2">Posso integrar com outras ferramentas?</h4>
              <p className="text-sm text-muted-foreground">
                Sim! Oferecemos integrações com WhatsApp, Instagram, Facebook e outras plataformas. Entre em contato para mais detalhes.
              </p>
            </div>

            <div>
              <h4 className="font-medium mb-2">Como exportar relatórios?</h4>
              <p className="text-sm text-muted-foreground">
                Vá para Dashboard {'>'} Relatórios e clique no botão "Exportar" no formato desejado (PDF, Excel).
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};