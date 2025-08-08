import React from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Download } from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';

const InstallPrompt: React.FC = () => {
  const { canInstall, installApp } = usePWA();

  if (!canInstall) return null;

  return (
    <div className="fixed bottom-20 left-0 right-0 z-50 px-4 md:hidden">
      <Alert className="shadow-lg">
        <AlertDescription className="flex items-center justify-between w-full gap-3">
          <div className="text-sm">
            Install the app for faster access and offline support.
          </div>
          <Button size="sm" onClick={installApp} className="shrink-0">
            <Download className="h-4 w-4 mr-2" />
            Install
          </Button>
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default InstallPrompt;