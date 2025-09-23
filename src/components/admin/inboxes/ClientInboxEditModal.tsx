import React, { useState, useEffect } from 'react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../ui/dialog';
import { Alert, AlertDescription } from '../../ui/alert';
import { Channel } from '../../../models/admin';

interface ClientInboxEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  inbox: Channel | null;
  onSubmit: (data: Partial<Channel>) => void;
  isLoading: boolean;
}

export const ClientInboxEditModal: React.FC<ClientInboxEditModalProps> = ({
  open,
  onOpenChange,
  inbox,
  onSubmit,
  isLoading,
}) => {
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [errors, setErrors] = useState<{ name?: string; phoneNumber?: string }>({});

  useEffect(() => {
    if (inbox) {
      setName(inbox.name);
      setPhoneNumber(inbox.phone_number || '');
      setErrors({});
    } else {
      setName('');
      setPhoneNumber('');
      setErrors({});
    }
  }, [inbox]);

  const validateForm = () => {
    const newErrors: { name?: string; phoneNumber?: string } = {};
    
    if (!name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    } else if (name.trim().length < 3) {
      newErrors.name = 'Nome deve ter pelo menos 3 caracteres';
    } else if (name.trim().length > 50) {
      newErrors.name = 'Nome deve ter no máximo 50 caracteres';
    }

    if (inbox?.channel_type === 'whatsapp' && phoneNumber.trim()) {
      const phoneRegex = /^\+\d{1,3}\s?\d{2}\s?\d{4,5}-?\d{4}$/;
      if (!phoneRegex.test(phoneNumber.trim())) {
        newErrors.phoneNumber = 'Formato inválido. Use: +55 11 99999-9999';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    onSubmit({
      name: name.trim(),
      phone_number: phoneNumber.trim() || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Inbox</DialogTitle>
          <DialogDescription>
            Atualize as informações do inbox.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Nome</Label>
            <Input
              id="edit-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) {
                  setErrors(prev => ({ ...prev, name: undefined }));
                }
              }}
              placeholder="Nome do inbox"
              className={errors.name ? 'border-destructive' : ''}
            />
            {errors.name && (
              <Alert className="py-2">
                <AlertDescription className="text-sm text-destructive">
                  {errors.name}
                </AlertDescription>
              </Alert>
            )}
          </div>

          {inbox?.channel_type === 'whatsapp' && (
            <div className="space-y-2">
              <Label htmlFor="edit-phone">Número de Telefone</Label>
              <Input
                id="edit-phone"
                value={phoneNumber}
                onChange={(e) => {
                  setPhoneNumber(e.target.value);
                  if (errors.phoneNumber) {
                    setErrors(prev => ({ ...prev, phoneNumber: undefined }));
                  }
                }}
                placeholder="+55 11 99999-9999"
                className={errors.phoneNumber ? 'border-destructive' : ''}
              />
              {errors.phoneNumber && (
                <Alert className="py-2">
                  <AlertDescription className="text-sm text-destructive">
                    {errors.phoneNumber}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};