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
const ExploreTemplates = lazy(() => import("./features/templates/ExploreTemplates"));
const LoginRedirectHandler = lazy(() => import("./LoginRedirectHandler"));
const ForgotPassword = lazy(() => import("./ForgotPassword"));
const RegisterPage = lazy(() => import("./RegisterPage"));
const GroupManagement = lazy(() => import("./features/contacts/GroupManagement"));
const UserSetting = lazy(() => import("./features/flow/UserSetting"));
const OnboardingGuide = lazy(() => import("./features/onboard/OnboardingGuide"));

function App() {
  return (
    <>
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
        style={{
          zIndex: 999999, 
          position: 'fixed',
          top: '1rem',
          right: '1rem'
        }}
        toastStyle={{
          marginBottom: '1rem',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
        }}
      />

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
          <Route
            path="/onboarding-guide"
            element={
              <ErrorBoundary>
                <OnboardingGuide />
              </ErrorBoundary>
            }
          />

          {/* Protected Routes */}
          <Route element={<PrivateRoute />}>
            <Route element={<DashboardLayout />}>
              <Route
                path="/dashboard"
                element={
                  <ErrorBoundary>
                    <DashboardHome />
                  </ErrorBoundary>
                }
              />
              <Route
                path="/contact"
                element={
                  <ErrorBoundary>
                    <ContactList />
                  </ErrorBoundary>
                }
              />
              <Route
                path="/contact/group"
                element={
                  <ErrorBoundary>
                    <GroupManagement />
                  </ErrorBoundary>
                }
              />
              <Route
                path="/templates"
                element={
                  <ErrorBoundary>
                    <Templates />
                  </ErrorBoundary>
                }
              />
              <Route
                path="/templates/explore"
                element={
                  <ErrorBoundary>
                    <ExploreTemplates />
                  </ErrorBoundary>
                }
              />
              <Route
                path="/chats"
                element={
                  <ErrorBoundary>
                    <Chats />
                  </ErrorBoundary>
                }
              />
              <Route
                path="/broadcast"
                element={
                  <ErrorBoundary>
                    <Broadcast />
                  </ErrorBoundary>
                }
              />
              <Route
                path="/settings"
                element={
                  <ErrorBoundary>
                    <UserSetting />
                  </ErrorBoundary>
                }
              />
              <Route
                path="/flow"
                element={
                  <ErrorBoundary>
                    <Setting />
                  </ErrorBoundary>
                }
              />
              <Route
                path="/help"
                element={
                  <ErrorBoundary>
                    <Help />
                  </ErrorBoundary>
                }
              />
              <Route
                path="/contacts"
                element={<Navigate to="/contact" replace />}
              />
            </Route>
          </Route>

          {/* Redirect root to dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Fallback */}
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
    </>
  );
}

export default App;
