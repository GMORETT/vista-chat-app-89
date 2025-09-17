import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { contactsApi } from '../api/contacts';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Mail, Phone, User, MessageCircle, Tag } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const contactId = id ? parseInt(id, 10) : null;

  const { data: contact, isLoading: contactLoading, error: contactError } = useQuery({
    queryKey: ['contact', contactId],
    queryFn: async () => {
      if (!contactId) return null;
      const response = await contactsApi.getContact(contactId);
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data!;
    },
    enabled: !!contactId,
  });

  const { data: conversations, isLoading: conversationsLoading } = useQuery({
    queryKey: ['contact-conversations', contactId],
    queryFn: async () => {
      if (!contactId) return [];
      const response = await contactsApi.getContactConversations(contactId);
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data!;
    },
    enabled: !!contactId,
  });

  const { data: labels } = useQuery({
    queryKey: ['contact-labels', contactId],
    queryFn: async () => {
      if (!contactId) return [];
      const response = await contactsApi.getContactLabels(contactId);
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data!;
    },
    enabled: !!contactId,
  });

  if (contactLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (contactError) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="text-lg font-medium text-danger mb-2">Erro ao carregar contato</div>
          <div className="text-sm text-muted">{contactError.message}</div>
        </div>
      </div>
    );
  }

  if (!contact) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="text-lg font-medium text-foreground mb-2">Contato não encontrado</div>
          <div className="text-sm text-muted">O contato solicitado não existe ou foi removido</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contact Info */}
        <div className="lg:col-span-1">
          <Card className="p-6">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-2xl font-bold mx-auto mb-4">
                {contact.name?.charAt(0).toUpperCase() || <User className="h-8 w-8" />}
              </div>
              <h1 className="text-xl font-bold text-foreground">{contact.name || 'Sem nome'}</h1>
              <p className="text-muted">ID: {contact.id}</p>
            </div>

            <div className="space-y-4">
              {contact.email && (
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted" />
                  <div>
                    <div className="text-sm text-muted">Email</div>
                    <div className="text-foreground">{contact.email}</div>
                  </div>
                </div>
              )}

              {contact.phone_number && (
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted" />
                  <div>
                    <div className="text-sm text-muted">Telefone</div>
                    <div className="text-foreground">{contact.phone_number}</div>
                  </div>
                </div>
              )}

              {/* Labels */}
              {labels && labels.length > 0 && (
                <div>
                  <div className="text-sm text-muted mb-2 flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    Labels
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {labels.map((label) => (
                      <Badge key={label} variant="outline" className="text-xs">
                        {label}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Custom Attributes */}
              {contact.custom_attributes && Object.keys(contact.custom_attributes).length > 0 && (
                <div>
                  <div className="text-sm text-muted mb-2">Atributos personalizados</div>
                  <div className="space-y-2">
                    {Object.entries(contact.custom_attributes).map(([key, value]) => (
                      <div key={key} className="text-sm">
                        <span className="font-medium">{key}:</span> {String(value)}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6">
              <Button className="w-full">
                <MessageCircle className="h-4 w-4 mr-2" />
                Nova conversa
              </Button>
            </div>
          </Card>
        </div>

        {/* Conversations */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <h2 className="text-lg font-bold text-foreground mb-4">
              Conversas ({conversations?.length || 0})
            </h2>

            {conversationsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : conversations && conversations.length > 0 ? (
              <div className="space-y-4">
                {conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className="p-4 border border-border rounded-lg hover:bg-accent/5 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">
                          {conversation.status}
                        </Badge>
                        {conversation.priority && (
                          <Badge variant="outline">
                            {conversation.priority}
                          </Badge>
                        )}
                        {conversation.unread_count > 0 && (
                          <Badge variant="destructive">
                            {conversation.unread_count} não lidas
                          </Badge>
                        )}
                      </div>
                      <span className="text-xs text-muted">
                        {new Date(conversation.last_activity_at * 1000).toLocaleDateString('pt-BR')}
                      </span>
                    </div>

                    <div className="text-sm text-muted">
                      {conversation.meta.channel} • ID: {conversation.id}
                    </div>

                    {conversation.labels.length > 0 && (
                      <div className="flex gap-1 mt-2">
                        {conversation.labels.slice(0, 3).map((label) => (
                          <Badge key={label} variant="outline" className="text-xs">
                            {label}
                          </Badge>
                        ))}
                        {conversation.labels.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{conversation.labels.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}

                    {conversation.meta.assignee && (
                      <div className="text-xs text-muted mt-1">
                        Atribuído a: {conversation.meta.assignee.name}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <div className="text-lg font-medium mb-2">Nenhuma conversa encontrada</div>
                <div className="text-sm">Este contato ainda não tem conversas</div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};