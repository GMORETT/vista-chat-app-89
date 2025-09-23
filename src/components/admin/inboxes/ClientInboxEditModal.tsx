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

  useEffect(() => {
    if (inbox) {
      setName(inbox.name);
      setPhoneNumber(inbox.phone_number || '');
    } else {
      setName('');
      setPhoneNumber('');
    }
  }, [inbox]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

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
              onChange={(e) => setName(e.target.value)}
              placeholder="Nome do inbox"
            />
          </div>

          {inbox?.channel_type === 'whatsapp' && (
            <div className="space-y-2">
              <Label htmlFor="edit-phone">Número de Telefone</Label>
              <Input
                id="edit-phone"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+55 11 99999-9999"
              />
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!name.trim() || isLoading}>
              {isLoading ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};