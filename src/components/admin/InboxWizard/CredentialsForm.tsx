import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChannelType } from '@/models/admin';
import { useCredentials } from '@/hooks/admin/useCredentials';
import { Eye, EyeOff, Shield } from 'lucide-react';

interface CredentialsFormProps {
  channel: ChannelType;
  credentials: Record<string, string | number>;
  credentialIds: Record<string, string>;
  onCredentialsChange: (credentials: Record<string, string | number>) => void;
  onCredentialIdsChange: (credentialIds: Record<string, string>) => void;
}

export const CredentialsForm: React.FC<CredentialsFormProps> = ({
  channel,
  credentials,
  credentialIds,
  onCredentialsChange,
  onCredentialIdsChange
}) => {
  const { data: serverCredentials, isLoading: loadingCredentials } = useCredentials();

  const handleFieldChange = (fieldName: string, value: string | number | boolean) => {
    onCredentialsChange({
      ...credentials,
      [fieldName]: String(value)
    });
  };

  const handleCredentialSelect = (fieldName: string, credentialId: string) => {
    if (credentialId === 'new') {
      // Remove credential ID and allow manual input
      const newCredentialIds = { ...credentialIds };
      delete newCredentialIds[fieldName];
      onCredentialIdsChange(newCredentialIds);
    } else {
      onCredentialIdsChange({
        ...credentialIds,
        [fieldName]: credentialId
      });
    }
  };

  const renderField = (field: any) => {
    const isUsingCredential = credentialIds[field.name];
    const value = credentials[field.name] || '';

    return (
      <div key={field.name} className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor={field.name} className="flex items-center space-x-1">
            <span>{field.label}</span>
            {field.required && <span className="text-destructive">*</span>}
            {field.sensitive && <Shield className="w-3 h-3 text-amber-500" />}
          </Label>
          {field.sensitive && (
            <Badge variant="secondary" className="text-xs">
              Sensível
            </Badge>
          )}
        </div>

        {field.sensitive && serverCredentials && serverCredentials.length > 0 ? (
          <div className="space-y-2">
            <Select
              value={isUsingCredential || 'new'}
              onValueChange={(value) => handleCredentialSelect(field.name, value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma credencial" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new">
                  <div className="flex items-center space-x-2">
                    <Eye className="w-4 h-4" />
                    <span>Digitar manualmente</span>
                  </div>
                </SelectItem>
                {serverCredentials.map((cred) => (
                  <SelectItem key={cred.id} value={cred.id}>
                    <div className="flex items-center space-x-2">
                      <Shield className="w-4 h-4 text-green-500" />
                      <span>{cred.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {!isUsingCredential && (
              <div className="relative">
                <Input
                  id={field.name}
                  type={field.type === 'password' ? 'password' : 'text'}
                  placeholder={field.placeholder}
                  value={value}
                  onChange={(e) => handleFieldChange(field.name, e.target.value)}
                  className="pr-10"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <EyeOff className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
            )}

            {isUsingCredential && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                <div className="flex items-center space-x-2 text-green-700">
                  <Shield className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    Usando credencial do servidor
                  </span>
                </div>
                <p className="text-xs text-green-600 mt-1">
                  Esta credencial está segura no servidor e não será exposta
                </p>
              </div>
            )}
          </div>
        ) : (
          <>
            {field.type === 'select' ? (
              <Select
                value={String(value)}
                onValueChange={(newValue) => handleFieldChange(field.name, newValue)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={field.placeholder} />
                </SelectTrigger>
                <SelectContent>
                  {field.options?.map((option: any) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : field.type === 'boolean' ? (
              <div className="flex items-center space-x-2">
                <Switch
                  id={field.name}
                  checked={Boolean(value)}
                  onCheckedChange={(checked) => handleFieldChange(field.name, checked)}
                />
                <Label htmlFor={field.name} className="text-sm text-muted-foreground">
                  {field.placeholder}
                </Label>
              </div>
            ) : field.type === 'textarea' ? (
              <Textarea
                id={field.name}
                placeholder={field.placeholder}
                value={String(value)}
                onChange={(e) => handleFieldChange(field.name, e.target.value)}
                rows={3}
              />
            ) : (
              <Input
                id={field.name}
                type={field.type || 'text'}
                placeholder={field.placeholder}
                value={String(value)}
                onChange={(e) => handleFieldChange(field.name, e.target.value)}
              />
            )}
          </>
        )}

        {field.description && (
          <p className="text-xs text-muted-foreground">{field.description}</p>
        )}
      </div>
    );
  };

  if (loadingCredentials) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Carregando credenciais...</p>
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <span>Configuração do {channel.name}</span>
        </CardTitle>
        <CardDescription>
          Configure as credenciais e parâmetros necessários para o canal
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {channel.fields.map(renderField)}
      </CardContent>
    </Card>
  );
};