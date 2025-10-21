import React, { lazy } from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Navigate, createBrowserRouter, RouterProvider } from 'react-router-dom';

import App from './App';
import './styles.css';

const DashboardRoute = lazy(() => import('./routes/dashboard'));
const ProjectsRoute = lazy(() => import('./routes/projects'));
const MessagesRoute = lazy(() => import('./routes/messages'));
const BookingsRoute = lazy(() => import('./routes/bookings'));

const queryClient = new QueryClient();

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <DashboardRoute /> },
      { path: 'messages', element: <MessagesRoute /> },
      { path: 'projects', element: <ProjectsRoute /> },
      { path: 'bookings', element: <BookingsRoute /> }
    ]
  }
]);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </React.StrictMode>
);
