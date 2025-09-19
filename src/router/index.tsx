import React, { Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { InboxPage } from '../pages/InboxPage';
import { LoginPage } from '../pages/LoginPage';
import { Skeleton } from '../components/ui/skeleton';
import { AdminApp } from '../apps/AdminApp';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { AuthProvider } from '../contexts/AuthContext';
import { InboxProvider } from '../contexts/InboxContext';
import { AdminClientProvider } from '../contexts/AdminClientProvider';

// Code splitting for better performance
const ConversationPage = React.lazy(() => import('../pages/ConversationPage').then(module => ({ default: module.ConversationPage })));
const ContactPage = React.lazy(() => import('../pages/ContactPage').then(module => ({ default: module.ContactPage })));

// Admin pages - lazy loaded
const DashboardPage = React.lazy(() => import('../pages/admin/DashboardPage').then(module => ({ default: module.DashboardPage })));
const ClientsPage = React.lazy(() => import('../pages/admin/ClientsPage').then(module => ({ default: module.ClientsPage })));
const InboxesPage = React.lazy(() => import('../pages/admin/InboxesPage').then(module => ({ default: module.InboxesPage })));
const TeamsPage = React.lazy(() => import('../pages/admin/TeamsPage').then(module => ({ default: module.TeamsPage })));
const TeamWizard = React.lazy(() => import('../components/admin/teams/TeamWizard').then(module => ({ default: module.TeamWizard })));
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
};

// Admin client config for operator routes
const adminClientConfig = {
  apiBaseUrl: 'http://localhost:3001',
  getAuthToken: () => 'mock-token',
  chatwootAccountId: 'mock-account-id',
};

export const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    ),
  },
  {
    path: '/',
    element: (
      <AuthProvider>
        <AdminClientProvider config={adminClientConfig}>
          <InboxProvider>
            <ProtectedRoute>
              <InboxPage />
            </ProtectedRoute>
          </InboxProvider>
        </AdminClientProvider>
      </AuthProvider>
    ),
  },
  {
    path: '/conversation/:id',
    element: (
      <AuthProvider>
        <AdminClientProvider config={adminClientConfig}>
          <InboxProvider>
            <ProtectedRoute>
              <Suspense fallback={<PageLoader />}>
                <ConversationPage />
              </Suspense>
            </ProtectedRoute>
          </InboxProvider>
        </AdminClientProvider>
      </AuthProvider>
    ),
  },
  {
    path: '/contact/:id',
    element: (
      <AuthProvider>
        <AdminClientProvider config={adminClientConfig}>
          <InboxProvider>
            <ProtectedRoute>
              <Suspense fallback={<PageLoader />}>
                <ContactPage />
              </Suspense>
            </ProtectedRoute>
          </InboxProvider>
        </AdminClientProvider>
      </AuthProvider>
    ),
  },
  // Admin routes
  {
    path: '/admin',
    element: (
      <AuthProvider>
        <ProtectedRoute requiredRoles={['super_admin']}>
          <AdminApp mountOptions={mockMountOptions} />
        </ProtectedRoute>
      </AuthProvider>
    ),
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
        path: 'clients',
        element: (
          <Suspense fallback={<PageLoader />}>
            <ClientsPage />
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
        path: 'teams/new',
        element: (
          <Suspense fallback={<PageLoader />}>
            <TeamWizard />
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
      {
        path: 'clients/:accountId/labels',
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
      <AuthProvider>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-foreground mb-4">404</h1>
            <p className="text-muted mb-4">Página não encontrada</p>
            <a href="/" className="text-link hover:underline">
              Voltar para o início
            </a>
          </div>
        </div>
      </AuthProvider>
    ),
  },
]);