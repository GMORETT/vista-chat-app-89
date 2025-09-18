import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { useTeams } from '../../hooks/admin/useTeams';
import { Team } from '../../models/admin';
import { TeamsTable } from '../../components/admin/teams/TeamsTable';
import { TeamFormModal } from '../../components/admin/teams/TeamFormModal';
import { TeamMembersModal } from '../../components/admin/teams/TeamMembersModal';
import { ConfirmDeleteDialog } from '../../components/admin/teams/ConfirmDeleteDialog';

export const TeamsPage: React.FC = () => {
  const [showFormModal, setShowFormModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | undefined>();
  const { data: teams, isLoading } = useTeams();

  const handleEdit = (team: Team) => {
    setSelectedTeam(team);
    setShowFormModal(true);
  };

  const handleDelete = (team: Team) => {
    setSelectedTeam(team);
    setShowDeleteDialog(true);
  };

  const handleManageMembers = (team: Team) => {
    setSelectedTeam(team);
    setShowMembersModal(true);
  };

  const handleCreateNew = () => {
    setSelectedTeam(undefined);
    setShowFormModal(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-muted animate-pulse rounded" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Teams</h1>
          <p className="text-muted-foreground">
            Manage teams and assign agents
          </p>
        </div>
        <Button onClick={handleCreateNew} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Team
        </Button>
      </div>

      {teams && teams.length > 0 ? (
        <TeamsTable
          teams={teams}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onManageMembers={handleManageMembers}
        />
      ) : (
        <Card className="text-center py-12">
          <CardContent>
            <div className="text-muted-foreground mb-4">
              <div className="text-lg font-medium mb-2">No teams yet</div>
              <div className="text-sm">
                Create teams to organize your agents
              </div>
            </div>
            <Button onClick={handleCreateNew} className="flex items-center gap-2 mx-auto">
              <Plus className="h-4 w-4" />
              Create Your First Team
            </Button>
          </CardContent>
        </Card>
      )}

      <TeamFormModal
        open={showFormModal}
        onOpenChange={setShowFormModal}
        team={selectedTeam}
      />

      <TeamMembersModal
        open={showMembersModal}
        onOpenChange={setShowMembersModal}
        team={selectedTeam}
      />

      <ConfirmDeleteDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        team={selectedTeam}
      />
    </div>
  );
};