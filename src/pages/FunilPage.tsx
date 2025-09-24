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
  const totalValue = contacts.reduce((sum, contact) => sum + contact.value, 0);
  const avgProbability = totalContacts > 0 
    ? contacts.reduce((sum, contact) => sum + contact.probability, 0) / totalContacts 
    : 0;
  const expectedValue = contacts.reduce((sum, contact) => sum + (contact.value * contact.probability / 100), 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Get stage for viewing contact
  const getContactStage = (contact: Contact) => {
    return stages.find(stage => stage.id === contact.stageId);
  };

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Funil de Vendas</h1>
          <p className="text-muted-foreground mt-2">
            Visualize e gerencie seu pipeline de vendas
          </p>
        </div>
        
        <div className="flex gap-2">
          <StageManager
            stages={sortedStages}
            onAddStage={handleAddStage}
            onEditStage={handleEditStage}
            onDeleteStage={handleDeleteStage}
            onReorderStages={reorderStages}
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Contatos
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalContacts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Valor Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalValue)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Probabilidade Média
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(avgProbability)}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Valor Esperado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(expectedValue)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Funnel Stages */}
      <div className="flex gap-6 overflow-x-auto pb-4">
        {sortedStages.length === 0 ? (
          <Card className="w-full p-8">
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