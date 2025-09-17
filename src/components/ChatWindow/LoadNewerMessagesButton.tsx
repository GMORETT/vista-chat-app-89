import React from 'react';
import { Button } from '../ui/button';
import { ChevronUp } from 'lucide-react';

interface LoadNewerMessagesButtonProps {
  onLoadNewer: () => void;
  isLoading?: boolean;
  hasNewerMessages?: boolean;
}

export const LoadNewerMessagesButton: React.FC<LoadNewerMessagesButtonProps> = ({
  onLoadNewer,
  isLoading = false,
  hasNewerMessages = false
}) => {
  if (!hasNewerMessages) return null;

  return (
    <div className="flex justify-center p-3 border-b border-border">
      <Button
        variant="outline"
        size="sm"
        onClick={onLoadNewer}
        disabled={isLoading}
        className="text-sm"
      >
        {isLoading ? (
          <>
            <div className="animate-spin h-4 w-4 mr-2 border-2 border-primary border-t-transparent rounded-full" />
            Carregando...
          </>
        ) : (
          <>
            <ChevronUp className="h-4 w-4 mr-2" />
            Ver mensagens mais recentes
          </>
        )}
      </Button>
    </div>
  );
};