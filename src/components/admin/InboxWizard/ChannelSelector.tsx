import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ChannelType } from '@/models/admin';
import { Account } from '@/models/chat';
import { AccountSelector } from './AccountSelector';
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
  accounts: Account[];
  selectedAccount: Account | null;
  onSelectAccount: (account: Account) => void;
  channels: ChannelType[];
  selectedChannel: ChannelType | null;
  onSelectChannel: (channel: ChannelType) => void;
  name: string;
  onNameChange: (name: string) => void;
  isLoadingAccounts?: boolean;
  currentUserRole?: string;
}

const getChannelIcon = (channelType: string) => {
  switch (channelType.toLowerCase()) {
    case 'whatsapp':
    case 'whatsapp_cloud':
      return () => <img src="/assets/whatsapp-logo.webp" alt="WhatsApp" className="w-5 h-5" />;
    case 'facebook':
      return () => <img src="/assets/facebook-logo.svg" alt="Facebook" className="w-5 h-5" />;
    case 'instagram':
      return () => <img src="/assets/instagram-logo.jpg" alt="Instagram" className="w-5 h-5" />;
    case 'website':
    case 'web_widget':
      return Globe;
    case 'sms':
    case 'twilio_sms':
      return Smartphone;
    case 'voice':
    case 'twilio_voice':
      return Phone;
    case 'email':
      return Mail;
    case 'twitter':
      return Twitter;
    default:
      return MessageCircle;
  }
};

export const ChannelSelector: React.FC<ChannelSelectorProps> = ({
  accounts,
  selectedAccount,
  onSelectAccount,
  channels,
  selectedChannel,
  onSelectChannel,
  name,
  onNameChange,
  isLoadingAccounts = false,
  currentUserRole
}) => {
  return (
    <div className="space-y-6">
      {/* Account Selection */}
      <AccountSelector
        accounts={accounts}
        selectedAccount={selectedAccount}
        onSelectAccount={onSelectAccount}
        isLoading={isLoadingAccounts}
        currentUserRole={currentUserRole}
      />

      <div className="space-y-2">
        <Label htmlFor="inbox-name">Nome da Inbox</Label>
        <Input
          id="inbox-name"
          placeholder="Ex: Atendimento WhatsApp"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          disabled={!selectedAccount}
        />
        {!selectedAccount && (
          <p className="text-xs text-muted-foreground">
            Selecione um cliente primeiro
          </p>
        )}
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
            const IconComponent = getChannelIcon(channel.id);
            const isSelected = selectedChannel?.id === channel.id;
            
            return (
              <Card
                key={channel.id}
                className={`transition-all ${
                  !selectedAccount 
                    ? 'opacity-50 cursor-not-allowed' 
                    : `cursor-pointer hover:shadow-md ${
                        isSelected 
                          ? 'ring-2 ring-primary border-primary bg-primary/5' 
                          : 'hover:border-primary/50'
                      }`
                }`}
                onClick={() => selectedAccount && onSelectChannel(channel)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <IconComponent />
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