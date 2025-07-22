import React, { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import DashboardLayout from "./layouts/DashboardLayout";
import ErrorBoundary from "./components/ErrorBoundary";
import Loader from "./components/Loader";
import PrivateRoute from "./PrivateRoute";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import PrivacyPolicy from "./PrivacyPolicy";

const ContactList = lazy(() => import("./features/contacts/ContactList"));
const Templates = lazy(() => import("./features/templates/Templates"));
const Chats = lazy(() => import("./features/chats/Chats"));
const Help = lazy(() => import("./features/help/Help"));
const Setting = lazy(() => import("./features/settings/Setting"));
const Broadcast = lazy(() => import("./features/broadcast/Broadcast"));
const NotFound = lazy(() => import("./components/NotFound"));
const NotAuthorized = lazy(() => import("./components/NotAuthorized"));
const DashboardHome = lazy(() => import("./features/dashboard/DashboardHome"));
const ExploreTemplates = lazy(() =>import("./features/templates/ExploreTemplates"));
const LoginRedirectHandler = lazy(() => import("./LoginRedirectHandler"));
const ForgotPassword = lazy(() => import("./ForgotPassword"));
const RegisterPage = lazy(() => import("./RegisterPage"));
const GroupManagement = lazy(() => import("./features/contacts/GroupManagement"));
const UserSetting = lazy(() => import("./features/flow/UserSetting"));

function App() {
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
          <Route
            path="/privacy-policy"
            element={
              <ErrorBoundary>
                <PrivacyPolicy />
              </ErrorBoundary>
            }
          />

          {/* Protected User Routes */}
          <Route element={<PrivateRoute />}>
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
                path="contact/group"
                element={
                  <ErrorBoundary>
                    <GroupManagement />
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
                    <UserSetting />
                  </ErrorBoundary>
                }
              />
              <Route
                path="flow"
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

          {/* 404 - Not Found Route */}
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

      {/* Toast Notification */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
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