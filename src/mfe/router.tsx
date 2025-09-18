import React, { Suspense } from 'react';
import { createHashRouter, RouterProvider } from 'react-router-dom';
import { InboxPage } from '../pages/InboxPage';
import { AdminApp } from '../apps/AdminApp';
import { Skeleton } from '../components/ui/skeleton';
import { MountOptions } from './types';

// Code splitting for better performance
const ConversationPage = React.lazy(() => import('../pages/ConversationPage').then(module => ({ default: module.ConversationPage })));
const ContactPage = React.lazy(() => import('../pages/ContactPage').then(module => ({ default: module.ContactPage })));
const InboxesPage = React.lazy(() => import('../pages/admin/InboxesPage').then(module => ({ default: module.InboxesPage })));
const TeamsPage = React.lazy(() => import('../pages/admin/TeamsPage').then(module => ({ default: module.TeamsPage })));
const AgentsPage = React.lazy(() => import('../pages/admin/AgentsPage').then(module => ({ default: module.AgentsPage })));
const LabelsPage = React.lazy(() => import('../pages/admin/LabelsPage').then(module => ({ default: module.LabelsPage })));

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

interface MfeRouterProps {
  mountOptions: MountOptions;
  appType: 'operator' | 'admin';
}

export const MfeRouter: React.FC<MfeRouterProps> = ({ mountOptions, appType }) => {
  const basePath = mountOptions.basePath || '';
  
  const getRoutePath = (path: string) => {
    if (!basePath) return path;
    return path === '/' ? basePath : `${basePath}${path}`;
  };

  const routes = appType === 'admin' ? [
    {
      path: getRoutePath('/'),
      element: <AdminApp mountOptions={mountOptions} />,
      children: [
        {
          path: getRoutePath('/'),
          element: (
            <Suspense fallback={<PageLoader />}>
              <InboxesPage />
            </Suspense>
          ),
        },
        {
          path: getRoutePath('/admin'),
          element: (
            <Suspense fallback={<PageLoader />}>
              <InboxesPage />
            </Suspense>
          ),
        },
        {
          path: getRoutePath('/admin/inboxes'),
          element: (
            <Suspense fallback={<PageLoader />}>
              <InboxesPage />
            </Suspense>
          ),
        },
        {
          path: getRoutePath('/admin/teams'),
          element: (
            <Suspense fallback={<PageLoader />}>
              <TeamsPage />
            </Suspense>
          ),
        },
        {
          path: getRoutePath('/admin/agents'),
          element: (
            <Suspense fallback={<PageLoader />}>
              <AgentsPage />
            </Suspense>
          ),
        },
        {
          path: getRoutePath('/admin/labels'),
          element: (
            <Suspense fallback={<PageLoader />}>
              <LabelsPage />
            </Suspense>
          ),
        },
      ]
    },
    {
      path: '*',
      element: (
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-foreground mb-4">404</h1>
            <p className="text-muted mb-4">Página não encontrada</p>
            <a href={`#${basePath || '/'}`} className="text-link hover:underline">
              Voltar para o início
            </a>
          </div>
        </div>
      ),
    },
  ] : [
    {
      path: getRoutePath('/'),
      element: <InboxPage />,
    },
    {
      path: getRoutePath('/conversation/:id'),
      element: (
        <Suspense fallback={<PageLoader />}>
          <ConversationPage />
        </Suspense>
      ),
    },
    {
      path: getRoutePath('/contact/:id'),
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
            <a href={`#${basePath || '/'}`} className="text-link hover:underline">
              Voltar para o início
            </a>
          </div>
        </div>
      ),
    },
  ];

  const router = createHashRouter(routes);

  return <RouterProvider router={router} />;
};