import React, { useState } from 'react';
import { MessageSquare, Smartphone, Send } from 'lucide-react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../ui/dialog';
import { Badge } from '../../ui/badge';

interface ClientInboxWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
  isLoading: boolean;
}

const CHANNEL_OPTIONS = [
  {
    id: 'whatsapp',
    name: 'WhatsApp Cloud',
    description: 'WhatsApp Business API via Meta Cloud',
    icon: Smartphone,
    badge: 'Popular',
    badgeVariant: 'secondary' as const,
  },
  {
    id: 'facebook',
    name: 'Facebook Messenger',
    description: 'Facebook Messenger para páginas',
    icon: MessageSquare,
    badge: 'Recomendado',
    badgeVariant: 'default' as const,
  },
  {
    id: 'instagram',
    name: 'Instagram Direct',
    description: 'Mensagens diretas do Instagram',
    icon: Send,
    badge: 'Novo',
    badgeVariant: 'outline' as const,
  },
];

export const ClientInboxWizard: React.FC<ClientInboxWizardProps> = ({
  open,
  onOpenChange,
  onSubmit,
  isLoading,
}) => {
  const [step, setStep] = useState(1);
  const [selectedChannel, setSelectedChannel] = useState<string>('');
  const [inboxName, setInboxName] = useState('');

  const handleChannelSelect = (channelId: string) => {
    setSelectedChannel(channelId);
    setStep(2);
  };

  const handleSubmit = () => {
    if (!selectedChannel || !inboxName.trim()) return;

    onSubmit({
      name: inboxName,
      channel_type: selectedChannel,
    });
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
      setSelectedChannel('');
    }
  };

  const handleClose = () => {
    setStep(1);
    setSelectedChannel('');
    setInboxName('');
    onOpenChange(false);
  };

  const selectedChannelInfo = CHANNEL_OPTIONS.find(ch => ch.id === selectedChannel);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {step === 1 ? 'Escolher Canal' : 'Configurar Inbox'}
          </DialogTitle>
          <DialogDescription>
            {step === 1 
              ? 'Selecione o tipo de canal que deseja configurar para este cliente.'
              : `Configure seu inbox ${selectedChannelInfo?.name}.`
            }
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {step === 1 ? (
            <div className="grid gap-4">
              {CHANNEL_OPTIONS.map((channel) => {
                const IconComponent = channel.icon;
                return (
                  <Card 
                    key={channel.id}
                    className="cursor-pointer hover:bg-accent transition-colors"
                    onClick={() => handleChannelSelect(channel.id)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <IconComponent className="h-6 w-6 text-primary" />
                          <div>
                            <CardTitle className="text-base">{channel.name}</CardTitle>
                            <CardDescription className="text-sm">
                              {channel.description}
                            </CardDescription>
                          </div>
                        </div>
                        <Badge variant={channel.badgeVariant}>{channel.badge}</Badge>
                      </div>
                    </CardHeader>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                {selectedChannelInfo && <selectedChannelInfo.icon className="h-5 w-5 text-primary" />}
                <div>
                  <div className="font-medium">{selectedChannelInfo?.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {selectedChannelInfo?.description}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="inbox-name">Nome do Inbox</Label>
                <Input
                  id="inbox-name"
                  placeholder="Ex: Suporte WhatsApp"
                  value={inboxName}
                  onChange={(e) => setInboxName(e.target.value)}
                />
              </div>

              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-sm text-blue-800">
                  <strong>Nota:</strong> Por enquanto, apenas a configuração básica está disponível. 
                  Configurações específicas do canal serão adicionadas em versões futuras.
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <div className="flex gap-2 w-full">
            {step === 2 && (
              <Button variant="outline" onClick={handleBack}>
                Voltar
              </Button>
            )}
            <div className="flex-1" />
            <Button variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            {step === 2 && (
              <Button 
                onClick={handleSubmit}
                disabled={!inboxName.trim() || isLoading}
              >
                {isLoading ? 'Criando...' : 'Criar Inbox'}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};