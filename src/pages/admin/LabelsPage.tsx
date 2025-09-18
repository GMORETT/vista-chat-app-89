import React, { useState } from 'react';
import { Plus, Edit, Trash2, Tag } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { useLabels } from '../../hooks/admin/useLabels';
import { format } from 'date-fns';

export const LabelsPage: React.FC = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { data: labels, isLoading } = useLabels();

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
          <h1 className="text-2xl font-bold text-foreground">Labels</h1>
          <p className="text-muted-foreground">
            Organize conversations and contacts with labels
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Label
        </Button>
      </div>

      {labels && labels.length > 0 ? (
        <div className="space-y-6">
          {/* Labels Cloud */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Labels Cloud
              </CardTitle>
              <CardDescription>
                Visual overview of all labels
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {labels.map((label) => (
                  <Badge 
                    key={label.id}
                    style={{ backgroundColor: label.color }}
                    className="text-white hover:opacity-80 cursor-pointer"
                  >
                    {label.title}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Labels Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {labels.map((label) => (
              <Card key={label.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: label.color }}
                        />
                        <CardTitle className="text-lg">{label.title}</CardTitle>
                      </div>
                      {label.description && (
                        <CardDescription className="text-sm">
                          {label.description}
                        </CardDescription>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant={label.show_on_sidebar ? "default" : "secondary"}>
                      {label.show_on_sidebar ? "Sidebar" : "Hidden"}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {label.color}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Created {format(new Date(label.created_at), 'MMM d, yyyy')}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <Card className="text-center py-12">
          <CardContent>
            <div className="text-muted-foreground mb-4">
              <div className="text-lg font-medium mb-2">No labels yet</div>
              <div className="text-sm">
                Create labels to organize conversations and contacts
              </div>
            </div>
            <Button onClick={() => setShowCreateForm(true)} className="flex items-center gap-2 mx-auto">
              <Plus className="h-4 w-4" />
              Create Your First Label
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};