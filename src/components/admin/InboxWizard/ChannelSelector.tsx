import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ChannelType } from '@/models/admin';
import { 
  MessageCircle, 
  Globe, 
  Phone, 
  Mail, 
  Facebook, 
  Instagram,
  Twitter,
  Smartphone
} from 'lucide-react';

interface ChannelSelectorProps {
  channels: ChannelType[];
  selectedChannel: ChannelType | null;
  onSelectChannel: (channel: ChannelType) => void;
  name: string;
  onNameChange: (name: string) => void;
}

const getChannelIcon = (channelType: string) => {
  switch (channelType.toLowerCase()) {
    case 'website':
    case 'web_widget':
      return Globe;
    case 'whatsapp':
    case 'whatsapp_cloud':
      return MessageCircle;
    case 'sms':
    case 'twilio_sms':
      return Smartphone;
    case 'voice':
    case 'twilio_voice':
      return Phone;
    case 'email':
      return Mail;
    case 'facebook':
      return Facebook;
    case 'instagram':
      return Instagram;
    case 'twitter':
      return Twitter;
    default:
      return MessageCircle;
  }
};

export const ChannelSelector: React.FC<ChannelSelectorProps> = ({
  channels,
  selectedChannel,
  onSelectChannel,
  name,
  onNameChange
}) => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="inbox-name">Nome da Inbox</Label>
        <Input
          id="inbox-name"
          placeholder="Ex: Atendimento WhatsApp"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
        />
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Selecione o tipo de canal</h3>
          <p className="text-sm text-muted-foreground">
            Escolha como seus clientes irão se comunicar com você
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {channels.map((channel) => {
            const Icon = getChannelIcon(channel.id);
            const isSelected = selectedChannel?.id === channel.id;
            
            return (
              <Card
                key={channel.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  isSelected 
                    ? 'ring-2 ring-primary border-primary bg-primary/5' 
                    : 'hover:border-primary/50'
                }`}
                onClick={() => onSelectChannel(channel)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Icon className="w-5 h-5 text-primary" />
                      <CardTitle className="text-base">{channel.name}</CardTitle>
                    </div>
                    {isSelected && (
                      <Badge variant="default" className="text-xs">
                        Selecionado
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <CardDescription className="text-sm">
                    {channel.description}
                  </CardDescription>
                  {channel.fields && channel.fields.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs text-muted-foreground">
                        Campos necessários: {channel.fields.map(f => f.label).join(', ')}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};