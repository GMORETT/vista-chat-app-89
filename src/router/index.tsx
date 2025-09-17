import React, { Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { InboxPage } from '../pages/InboxPage';
import { Skeleton } from '../components/ui/skeleton';

// Code splitting for better performance
const ConversationPage = React.lazy(() => import('../pages/ConversationPage').then(module => ({ default: module.ConversationPage })));
const ContactPage = React.lazy(() => import('../pages/ContactPage').then(module => ({ default: module.ContactPage })));

// Loading component
const PageLoader = () => (
  <div className="h-screen flex items-center justify-center">
    <div className="space-y-4 w-full max-w-md">
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  </div>
);

export const router = createBrowserRouter([
  {
    path: '/',
    element: <InboxPage />,
  },
  {
    path: '/conversation/:id',
    element: (
      <Suspense fallback={<PageLoader />}>
        <ConversationPage />
      </Suspense>
    ),
  },
  {
    path: '/contact/:id',
    element: (
      <Suspense fallback={<PageLoader />}>
        <ContactPage />
      </Suspense>
    ),
  },
  {
    path: '*',
    element: (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">404</h1>
          <p className="text-muted mb-4">Página não encontrada</p>
          <a href="/" className="text-link hover:underline">
            Voltar para o início
          </a>
        </div>
      </div>
    ),
  },
]);