import React from 'react';
import { Users } from 'lucide-react';
import { Button } from '../../ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../ui/dialog';
import { Channel } from '../../../models/admin';

interface ClientInboxMembersModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  inbox: Channel | null;
}

export const ClientInboxMembersModal: React.FC<ClientInboxMembersModalProps> = ({
  open,
  onOpenChange,
  inbox,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Gerenciar Membros
          </DialogTitle>
          <DialogDescription>
            Gerencie os agentes que têm acesso ao inbox "{inbox?.name}".
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="text-center text-muted-foreground py-8">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Gerenciamento de membros será implementado em breve.</p>
            <p className="text-sm mt-2">
              Esta funcionalidade permitirá atribuir agentes específicos a cada inbox.
            </p>
          </div>
        </div>

        <div className="flex justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};