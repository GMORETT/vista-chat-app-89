import React from 'react';
import { Edit, Trash2, Users } from 'lucide-react';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { Team } from '../../../models/admin';
import { format } from 'date-fns';
import { useTeamMembers } from '../../../hooks/admin/useTeams';

interface TeamsTableProps {
  teams: Team[];
  onEdit: (team: Team) => void;
  onDelete: (team: Team) => void;
  onManageMembers: (team: Team) => void;
}

export const TeamsTable: React.FC<TeamsTableProps> = ({
  teams,
  onEdit,
  onDelete,
  onManageMembers,
}) => {
  return (
    <div className="border rounded-lg bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Auto-assign</TableHead>
            <TableHead>Members</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="w-[120px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {teams.map((team) => (
            <TeamRow
              key={team.id}
              team={team}
              onEdit={onEdit}
              onDelete={onDelete}
              onManageMembers={onManageMembers}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

interface TeamRowProps {
  team: Team;
  onEdit: (team: Team) => void;
  onDelete: (team: Team) => void;
  onManageMembers: (team: Team) => void;
}

const TeamRow: React.FC<TeamRowProps> = ({ team, onEdit, onDelete, onManageMembers }) => {
  const { data: members } = useTeamMembers(team.id);
  const memberCount = members?.length || 0;

  return (
    <TableRow>
      <TableCell className="font-medium">{team.name}</TableCell>
      <TableCell className="text-muted-foreground">
        {team.description || '—'}
      </TableCell>
      <TableCell>
        <Badge variant={team.allow_auto_assign ? 'default' : 'secondary'}>
          {team.allow_auto_assign ? 'Enabled' : 'Disabled'}
        </Badge>
      </TableCell>
      <TableCell>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onManageMembers(team)}
          className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
        >
          <Users className="h-4 w-4" />
          {memberCount} members
        </Button>
      </TableCell>
      <TableCell className="text-muted-foreground">
        {format(new Date(team.created_at), 'MMM d, yyyy')}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(team)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(team)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};