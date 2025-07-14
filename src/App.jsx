import React, { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import DashboardLayout from "./layouts/DashboardLayout";
import ErrorBoundary from "./components/ErrorBoundary";
import Loader from "./components/Loader";
import PrivateRoute from "./PrivateRoute";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { useAuth } from "./context/AuthContext";
import AdminLayout from "./layouts/AdminLayout";
import { useBackButtonHandler } from "./hooks/useBackButtonHandler";

// Lazy load components
const ContactList = lazy(() => import("./features/contacts/ContactList"));
const Templates = lazy(() => import("./features/templates/Templates"));
const Chats = lazy(() => import("./features/chats/Chats"));
const Help = lazy(() => import("./features/help/Help"));
const Setting = lazy(() => import("./features/settings/Setting"));
const Broadcast = lazy(() => import("./features/broadcast/Broadcast"));
const NotFound = lazy(() => import("./components/NotFound"));
const NotAuthorized = lazy(() => import("./components/NotAuthorized"));
const DashboardHome = lazy(() => import("./features/dashboard/DashboardHome"));
const ExploreTemplates = lazy(() =>
  import("./features/templates/ExploreTemplates")
);
const LoginRedirectHandler = lazy(() => import("./LoginRedirectHandler"));
const ForgotPassword = lazy(() => import("./ForgotPassword"));
const RegisterPage = lazy(() => import("./RegisterPage"));

// Admin components
const AdminDashboard = lazy(() => import("./features/admin/AdminDashboard"));
const RoleManagement = lazy(() => import("./features/admin/RoleManagement"));

// Role-based route protection component
const AdminRoute = ({ children }) => {
  const { user } = useAuth();

  if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

function App() {
  useBackButtonHandler();
  
  return (
    <>
      <Suspense fallback={<Loader />}>
        <Routes>
          {/* Public Routes */}
          <Route
            path="/login"
            element={
              <ErrorBoundary>
                <LoginRedirectHandler />
              </ErrorBoundary>
            }
          />
          <Route
            path="/register"
            element={
              <ErrorBoundary>
                <RegisterPage />
              </ErrorBoundary>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <ErrorBoundary>
                <ForgotPassword />
              </ErrorBoundary>
            }
          />
          <Route
            path="/unauthorized"
            element={
              <ErrorBoundary>
                <NotAuthorized />
              </ErrorBoundary>
            }
          />

          {/* Protected Routes */}
          <Route element={<PrivateRoute />}>
            {/* Admin Routes - Protected by role */}
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminLayout />
                </AdminRoute>
              }
            >
              <Route
                index
                element={<Navigate to="/admin/dashboard" replace />}
              />
              <Route
                path="dashboard"
                element={
                  <ErrorBoundary>
                    <AdminDashboard />
                  </ErrorBoundary>
                }
              />
              <Route
                path="roles"
                element={
                  <ErrorBoundary>
                    <RoleManagement />
                  </ErrorBoundary>
                }
              />
            </Route>
            {/* User Routes */}
            <Route path="/" element={<DashboardLayout />}>
              <Route
                index
                element={
                  <ErrorBoundary>
                    <DashboardHome />
                  </ErrorBoundary>
                }
              />
              <Route
                path="contact"
                element={
                  <ErrorBoundary>
                    <ContactList />
                  </ErrorBoundary>
                }
              />
              <Route
                path="templates"
                element={
                  <ErrorBoundary>
                    <Templates />
                  </ErrorBoundary>
                }
              />
              <Route
                path="templates/explore"
                element={
                  <ErrorBoundary>
                    <ExploreTemplates />
                  </ErrorBoundary>
                }
              />
              <Route
                path="chats"
                element={
                  <ErrorBoundary>
                    <Chats />
                  </ErrorBoundary>
                }
              />
              <Route
                path="broadcast"
                element={
                  <ErrorBoundary>
                    <Broadcast />
                  </ErrorBoundary>
                }
              />
              <Route
                path="settings"
                element={
                  <ErrorBoundary>
                    <Setting />
                  </ErrorBoundary>
                }
              />
              <Route
                path="help"
                element={
                  <ErrorBoundary>
                    <Help />
                  </ErrorBoundary>
                }
              />
              <Route
                path="contacts"
                element={<Navigate to="/contact" replace />}
              />
            </Route>
          </Route>
          {/* Place the NotFound route globally at the end */}
          <Route
            path="*"
            element={
              <ErrorBoundary>
                <NotFound />
              </ErrorBoundary>
            }
          />
        </Routes>
      </Suspense>
      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </>
  );
}

export default App;