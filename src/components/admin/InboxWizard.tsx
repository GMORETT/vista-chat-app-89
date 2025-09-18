import React, { useState } from 'react';
import { X, ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { useChannelTypes, useCreateInbox } from '../../hooks/admin/useInboxes';
import { ChannelType, CreateChannelRequest } from '../../models/admin';

interface InboxWizardProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const InboxWizard: React.FC<InboxWizardProps> = ({ onClose, onSuccess }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedChannel, setSelectedChannel] = useState<ChannelType | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  
  const { data: channelTypes = [] } = useChannelTypes();
  const createInbox = useCreateInbox();

  const steps = [
    { id: 1, title: 'Choose Channel', description: 'Select communication channel' },
    { id: 2, title: 'Configuration', description: 'Configure channel settings' },
    { id: 3, title: 'Review', description: 'Review and create' },
  ];

  const handleChannelSelect = (channel: ChannelType) => {
    setSelectedChannel(channel);
    setFormData({ channel_type: channel.id });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCreate = async () => {
    try {
      const requestData: CreateChannelRequest = {
        name: formData.name,
        channel_type: formData.channel_type,
        phone_number: formData.phone_number,
        webhook_url: formData.webhook_url,
        provider_config: {
          access_token: formData.access_token,
          webhook_verify_token: formData.webhook_verify_token,
          account_sid: formData.account_sid,
          auth_token: formData.auth_token,
          website_url: formData.website_url,
        }
      };

      await createInbox.mutateAsync(requestData);
      onSuccess();
    } catch (error) {
      console.error('Error creating inbox:', error);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {channelTypes.map((channel) => (
                <Card 
                  key={channel.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedChannel?.id === channel.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => handleChannelSelect(channel)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{channel.icon}</div>
                      <div>
                        <CardTitle className="text-lg">{channel.name}</CardTitle>
                        <CardDescription className="text-sm">
                          {channel.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        );

      case 2:
        if (!selectedChannel) return null;
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="secondary">{selectedChannel.name}</Badge>
              <span className="text-sm text-muted-foreground">Configuration</span>
            </div>
            
            <div className="grid gap-4">
              {selectedChannel.fields.map((field) => (
                <div key={field.name} className="space-y-2">
                  <Label htmlFor={field.name}>
                    {field.label}
                    {field.required && <span className="text-destructive ml-1">*</span>}
                  </Label>
                  <Input
                    id={field.name}
                    type={field.type === 'password' ? 'password' : 'text'}
                    placeholder={field.placeholder}
                    value={formData[field.name] || ''}
                    onChange={(e) => handleInputChange(field.name, e.target.value)}
                    required={field.required}
                  />
                </div>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">Ready to Create</h3>
              <p className="text-muted-foreground">Review your inbox configuration</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Inbox Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Name:</span>
                  <span className="font-medium">{formData.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type:</span>
                  <Badge variant="secondary">{selectedChannel?.name}</Badge>
                </div>
                {formData.phone_number && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Phone:</span>
                    <span className="font-medium">{formData.phone_number}</span>
                  </div>
                )}
                {formData.website_url && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Website:</span>
                    <span className="font-medium">{formData.website_url}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return selectedChannel !== null;
      case 2:
        if (!selectedChannel) return false;
        return selectedChannel.fields
          .filter(field => field.required)
          .every(field => formData[field.name]);
      case 3:
        return true;
      default:
        return false;
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Create New Inbox</DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-6">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                ${currentStep >= step.id 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted text-muted-foreground'
                }
              `}>
                {currentStep > step.id ? <Check className="w-4 h-4" /> : step.id}
              </div>
              <div className="ml-3 text-sm">
                <div className="font-medium">{step.title}</div>
                <div className="text-muted-foreground">{step.description}</div>
              </div>
              {index < steps.length - 1 && (
                <div className="mx-4 h-px bg-border flex-1" />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="min-h-[300px]">
          {renderStepContent()}
        </div>

        {/* Actions */}
        <div className="flex justify-between pt-6 border-t">
          <Button 
            variant="outline" 
            onClick={currentStep === 1 ? onClose : handleBack}
            disabled={createInbox.isPending}
          >
            {currentStep === 1 ? (
              <>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </>
            ) : (
              <>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </>
            )}
          </Button>

          <Button 
            onClick={currentStep === 3 ? handleCreate : handleNext}
            disabled={!canProceed() || createInbox.isPending}
          >
            {currentStep === 3 ? (
              createInbox.isPending ? (
                'Creating...'
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Create Inbox
                </>
              )
            ) : (
              <>
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};