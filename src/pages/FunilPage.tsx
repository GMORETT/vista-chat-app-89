import React, { useState } from 'react';
import { useCRMStore } from '../state/stores/crmStore';
import { Stage, Contact } from '../types/crm';
import { Button } from '../components/ui/button';
import { BarChart3 } from 'lucide-react';
import { FunnelStage } from '../components/crm/FunnelStage';
import { StageModal } from '../components/crm/StageModal';
import { StageManager } from '../components/crm/StageManager';
import { ContactDetailsModal } from '../components/crm/ContactDetailsModal';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { toast } from 'sonner';

export const FunilPage: React.FC = () => {
  const {
    stages,
    contacts,
    addStage,
    updateStage,
    deleteStage,
    reorderStages,
    moveContact,
  } = useCRMStore();

  const [stageModalOpen, setStageModalOpen] = useState(false);
  const [contactDetailsModalOpen, setContactDetailsModalOpen] = useState(false);
  const [editingStage, setEditingStage] = useState<Stage | undefined>();
  const [viewingContact, setViewingContact] = useState<Contact | undefined>();

  // Sort stages by order
  const sortedStages = [...stages].sort((a, b) => a.order - b.order);

  const handleContactClick = (contact: Contact) => {
    setViewingContact(contact);
    setContactDetailsModalOpen(true);
  };

  const handleAddStage = () => {
    setEditingStage(undefined);
    setStageModalOpen(true);
  };

  const handleEditStage = (stage: Stage) => {
    setEditingStage(stage);
    setStageModalOpen(true);
  };

  const handleSaveStage = (stageData: Omit<Stage, 'id'>) => {
    if (editingStage) {
      updateStage(editingStage.id, stageData);
      toast.success('Etapa atualizada com sucesso!');
    } else {
      const newOrder = Math.max(...stages.map(s => s.order), 0) + 1;
      addStage({ ...stageData, order: newOrder });
      toast.success('Etapa criada com sucesso!');
    }
    setStageModalOpen(false);
    setEditingStage(undefined);
  };

  const handleDeleteStage = (stageId: string) => {
    const stageContacts = contacts.filter(c => c.stageId === stageId);
    if (stageContacts.length > 0) {
      toast.error('Não é possível excluir uma etapa que possui contatos. Mova os contatos primeiro.');
      return;
    }
    deleteStage(stageId);
    toast.success('Etapa excluída com sucesso!');
  };

  const handleContactDrop = (contactId: string, newStageId: string) => {
    const contact = contacts.find(c => c.id === contactId);
    if (contact && contact.stageId !== newStageId) {
      moveContact(contactId, newStageId);
      toast.success('Contato movido com sucesso!');
    }
  };

  // Calculate stats
  const totalContacts = contacts.length;

  // Get stage for viewing contact
  const getContactStage = (contact: Contact) => {
    return stages.find(stage => stage.id === contact.stageId);
  };

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Funil de Vendas</h1>
            <p className="text-sm text-muted-foreground">
              Visualize e gerencie seu pipeline de vendas
            </p>
          </div>
          
          {/* Stats inline with header */}
          <div className="ml-8">
            <Card className="px-4 py-2">
              <div className="flex items-center gap-3">
                <BarChart3 className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Total de Leads</p>
                  <p className="text-lg font-bold">{totalContacts}</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
        
        <StageManager
          stages={sortedStages}
          onAddStage={handleAddStage}
          onEditStage={handleEditStage}
          onDeleteStage={handleDeleteStage}
          onReorderStages={reorderStages}
        />
      </div>

      {/* Funnel Stages */}
      <div className="flex-1 min-h-0">
        <div className="flex gap-4 overflow-x-auto pb-4 h-full">
          {sortedStages.length === 0 ? (
            <Card className="w-full p-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">Nenhuma etapa criada</h3>
                <p className="text-muted-foreground mb-4">
                  Crie sua primeira etapa para começar a organizar seus contatos
                </p>
                <Button onClick={handleAddStage}>
                  Criar Primeira Etapa
                </Button>
              </div>
            </Card>
          ) : (
            sortedStages.map((stage) => {
              const stageContacts = contacts.filter(contact => contact.stageId === stage.id);
              return (
                <FunnelStage
                  key={stage.id}
                  stage={stage}
                  contacts={stageContacts}
                  onEditStage={handleEditStage}
                  onDeleteStage={handleDeleteStage}
                  onContactClick={handleContactClick}
                  onContactDrop={handleContactDrop}
                />
              );
            })
          )}
        </div>
      </div>

      {/* Modals */}
      <StageModal
        isOpen={stageModalOpen}
        onClose={() => {
          setStageModalOpen(false);
          setEditingStage(undefined);
        }}
        onSave={handleSaveStage}
        stage={editingStage}
      />

      <ContactDetailsModal
        isOpen={contactDetailsModalOpen}
        onClose={() => {
          setContactDetailsModalOpen(false);
          setViewingContact(undefined);
        }}
        contact={viewingContact}
        stage={viewingContact ? getContactStage(viewingContact) : undefined}
      />
    </div>
  );
};