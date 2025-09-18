import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { WizardData } from './InboxWizard';
import { Shield, Eye, EyeOff } from 'lucide-react';

interface SummaryStepProps {
  wizardData: WizardData;
}

export const SummaryStep: React.FC<SummaryStepProps> = ({ wizardData }) => {
  const { name, selectedChannel, credentials, credentialIds } = wizardData;

  if (!selectedChannel) {
    return (
      <div className="text-center text-muted-foreground">
        Nenhum canal selecionado
      </div>
    );
  }

  const renderCredentialValue = (field: any, value: any) => {
    const isUsingCredential = credentialIds[field.name];
    
    if (field.sensitive) {
      if (isUsingCredential) {
        return (
          <div className="flex items-center space-x-2 text-green-600">
            <Shield className="w-4 h-4" />
            <span className="text-sm">Credencial do servidor</span>
          </div>
        );
      } else if (value) {
        return (
          <div className="flex items-center space-x-2 text-amber-600">
            <EyeOff className="w-4 h-4" />
            <span className="text-sm font-mono">{'•'.repeat(8)}</span>
          </div>
        );
      }
    }

    if (field.type === 'boolean') {
      return (
        <Badge variant={value ? 'default' : 'secondary'}>
          {value ? 'Sim' : 'Não'}
        </Badge>
      );
    }

    return value || <span className="text-muted-foreground">Não definido</span>;
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold">Revise as configurações</h3>
        <p className="text-sm text-muted-foreground">
          Verifique se todas as informações estão corretas antes de criar a inbox
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações Gerais</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 items-center">
            <span className="font-medium">Nome:</span>
            <span className="col-span-2">{name}</span>
          </div>
          <Separator />
          <div className="grid grid-cols-3 items-center">
            <span className="font-medium">Tipo de Canal:</span>
            <span className="col-span-2">{selectedChannel.name}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Configurações do Canal</CardTitle>
          <CardDescription>
            Credenciais e parâmetros específicos do {selectedChannel.name}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {selectedChannel.fields.map((field, index) => {
            const value = credentials[field.name];
            
            return (
              <div key={field.name}>
                <div className="grid grid-cols-3 items-center">
                  <div className="flex items-center space-x-1">
                    <span className="font-medium">{field.label}:</span>
                    {field.sensitive && <Shield className="w-3 h-3 text-amber-500" />}
                  </div>
                  <div className="col-span-2">
                    {renderCredentialValue(field, value)}
                  </div>
                </div>
                {index < selectedChannel.fields.length - 1 && <Separator className="mt-4" />}
              </div>
            );
          })}
        </CardContent>
      </Card>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Eye className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900">Sobre Credenciais Sensíveis</h4>
            <p className="text-sm text-blue-700 mt-1">
              Credenciais marcadas como sensíveis são protegidas e armazenadas de forma segura no servidor.
              Elas não são expostas no frontend e são referenciadas apenas por ID.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};