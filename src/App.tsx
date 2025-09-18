import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import { MfeRouter } from "./mfe/router";
import { MountOptions } from "./mfe/types";
import { AuthProvider } from "./contexts/AuthContext";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

interface AppProps {
  mountOptions?: MountOptions;
  appType?: 'operator' | 'admin';
}

const App: React.FC<AppProps> = ({ mountOptions, appType }) => {
  const isMFE = !!mountOptions;
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider delayDuration={300} skipDelayDuration={100}>
        <Toaster />
        <Sonner />
        {isMFE ? (
          <AuthProvider>
            <MfeRouter mountOptions={mountOptions} appType={appType || 'operator'} />
          </AuthProvider>
        ) : (
          <RouterProvider router={router} />
        )}
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
