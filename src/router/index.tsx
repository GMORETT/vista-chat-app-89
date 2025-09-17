import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { InboxPage } from '../pages/InboxPage';
import { ConversationPage } from '../pages/ConversationPage';
import { ContactPage } from '../pages/ContactPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <InboxPage />,
  },
  {
    path: '/conversation/:id',
    element: <ConversationPage />,
  },
  {
    path: '/contact/:id',
    element: <ContactPage />,
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