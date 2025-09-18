import React, { Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { InboxPage } from '../pages/InboxPage';
import { Skeleton } from '../components/ui/skeleton';
import { AdminApp } from '../apps/AdminApp';

// Code splitting for better performance
const ConversationPage = React.lazy(() => import('../pages/ConversationPage').then(module => ({ default: module.ConversationPage })));
const ContactPage = React.lazy(() => import('../pages/ContactPage').then(module => ({ default: module.ContactPage })));

// Admin pages - lazy loaded
const DashboardPage = React.lazy(() => import('../pages/admin/DashboardPage').then(module => ({ default: module.DashboardPage })));
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

// Mock mount options for standalone admin access
const mockMountOptions = {
  apiBaseUrl: 'http://localhost:3001',
  getAuthToken: () => 'mock-token',
  chatwootAccountId: 'mock-account-id',
  currentUser: {
    id: 1,
    name: 'Admin User',
    email: 'admin@solabs.com',
    role: 'admin',
    roles: ['admin']
  }
};

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
  // Admin routes
  {
    path: '/admin',
    element: <AdminApp mountOptions={mockMountOptions} />,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<PageLoader />}>
            <DashboardPage />
          </Suspense>
        ),
      },
      {
        path: 'inboxes',
        element: (
          <Suspense fallback={<PageLoader />}>
            <InboxesPage />
          </Suspense>
        ),
      },
      {
        path: 'teams',
        element: (
          <Suspense fallback={<PageLoader />}>
            <TeamsPage />
          </Suspense>
        ),
      },
      {
        path: 'agents',
        element: (
          <Suspense fallback={<PageLoader />}>
            <AgentsPage />
          </Suspense>
        ),
      },
      {
        path: 'labels',
        element: (
          <Suspense fallback={<PageLoader />}>
            <LabelsPage />
          </Suspense>
        ),
      },
    ],
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