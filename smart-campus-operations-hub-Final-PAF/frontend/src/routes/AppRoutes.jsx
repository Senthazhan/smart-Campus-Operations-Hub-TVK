import React from "react";
import { Route, Routes, Navigate, useLocation } from "react-router-dom";
import { AppShell } from "../components/layout/AppShell";
import { LoginPage } from "../pages/LoginPage";
import { RegisterPage } from "../pages/RegisterPage";
import { OAuth2RedirectHandler } from "../pages/OAuth2RedirectHandler";
import { ForgotPasswordPage } from "../pages/ForgotPasswordPage";
import { ResetPasswordPage } from "../pages/ResetPasswordPage";
import { DashboardPage } from "../pages/DashboardPage";
import { ResourceCataloguePage } from "../pages/ResourceCataloguePage";
import { ResourceDetailsPage } from "../pages/ResourceDetailsPage";
import { ResourceAdminFormPage } from "../pages/ResourceAdminFormPage";
import { BookingRequestPage } from "../pages/BookingRequestPage";
import { MyBookingsPage } from "../pages/MyBookingsPage";
import { AdminBookingsPage } from "../pages/AdminBookingsPage";
import { TicketCreatePage } from "../pages/TicketCreatePage";
import { TicketListPage } from "../pages/TicketListPage";
import { TicketDetailsPage } from "../pages/TicketDetailsPage";
import { NotificationsPage } from "../pages/NotificationsPage";
import { EBooksPage } from "../pages/EBooksPage";
import { EBookSubmitPage } from "../pages/EBookSubmitPage";
import { AdminEBooksPage } from "../pages/AdminEBooksPage";
import { AdminUsersPage } from "../pages/AdminUsersPage";
import { AdminResourcesPage } from "../pages/AdminResourcesPage";
import { ProfilePage } from "../pages/ProfilePage";
import { ForbiddenPage } from "../pages/ForbiddenPage";
import { WelcomePage } from "../pages/WelcomePage";
import { NotFoundPage } from "../pages/NotFoundPage";
import AdminTicketsPage from "../pages/AdminTicketsPage";
import { TechnicianDashboardPage } from "../pages/TechnicianDashboardPage";
import { RequireAuth } from "./RequireAuth";
import { useAuth } from "../context/AuthContext";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/forbidden" element={<ForbiddenPage />} />

      <Route element={<AppShell />}>
        <Route
          path="/welcome"
          element={
            <RequireAuth>
              <WelcomePage />
            </RequireAuth>
          }
        />

        <Route
          path="/dashboard"
          element={
            <RequireAuth allowedRoles={["ADMIN"]}>
              <DashboardPage />
            </RequireAuth>
          }
        />

        <Route
          path="/technician/dashboard"
          element={
            <RequireAuth allowedRoles={["TECHNICIAN"]}>
              <TechnicianDashboardPage />
            </RequireAuth>
          }
        />

        {/* Resource Routes */}
        <Route
          path="/resources"
          element={
            <RequireAuth>
              <ResourceCataloguePage />
            </RequireAuth>
          }
        />
        <Route
          path="/resources/:id"
          element={
            <RequireAuth>
              <ResourceDetailsPage />
            </RequireAuth>
          }
        />

        {/* Admin Resource Management */}
        <Route
          path="/admin/resources/new"
          element={
            <RequireAuth allowedRoles={["ADMIN"]}>
              <ResourceAdminFormPage mode="create" />
            </RequireAuth>
          }
        />
        <Route
          path="/admin/resources/:id/edit"
          element={
            <RequireAuth allowedRoles={["ADMIN"]}>
              <ResourceAdminFormPage mode="edit" />
            </RequireAuth>
          }
        />

        {/* Booking Routes */}
        <Route
          path="/bookings/new"
          element={
            <RequireAuth>
              <BookingRequestPage />
            </RequireAuth>
          }
        />
        <Route
          path="/bookings/:id/edit"
          element={
            <RequireAuth>
              <BookingRequestPage />
            </RequireAuth>
          }
        />
        <Route
          path="/my-bookings"
          element={
            <RequireAuth>
              <MyBookingsPage />
            </RequireAuth>
          }
        />
        <Route
          path="/admin/bookings"
          element={
            <RequireAuth allowedRoles={["ADMIN"]}>
              <AdminBookingsPage />
            </RequireAuth>
          }
        />

        {/* Ticket Routes */}
        <Route
          path="/tickets"
          element={
            <RequireAuth>
              <TicketListPage />
            </RequireAuth>
          }
        />
        <Route
          path="/tickets/new"
          element={
            <RequireAuth>
              <TicketCreatePage />
            </RequireAuth>
          }
        />
        <Route
          path="/tickets/:id"
          element={
            <RequireAuth>
              <TicketDetailsPage />
            </RequireAuth>
          }
        />

        <Route
          path="/notifications"
          element={
            <RequireAuth>
              <NotificationsPage />
            </RequireAuth>
          }
        />
        <Route
          path="/e-books"
          element={
            <RequireAuth>
              <EBooksPage />
            </RequireAuth>
          }
        />
        <Route
          path="/e-books/submit"
          element={
            <RequireAuth>
              <EBookSubmitPage />
            </RequireAuth>
          }
        />
        <Route
          path="/admin/e-books"
          element={
            <RequireAuth allowedRoles={["ADMIN"]}>
              <AdminEBooksPage />
            </RequireAuth>
          }
        />
        <Route
          path="/profile"
          element={
            <RequireAuth>
              <ProfilePage />
            </RequireAuth>
          }
        />
        <Route
          path="/admin/users"
          element={
            <RequireAuth allowedRoles={["ADMIN"]}>
              <AdminUsersPage />
            </RequireAuth>
          }
        />
        <Route
          path="/admin/resources"
          element={
            <RequireAuth allowedRoles={["ADMIN"]}>
              <AdminResourcesPage />
            </RequireAuth>
          }
        />
        <Route
          path="/admin/tickets"
          element={
            <RequireAuth allowedRoles={["ADMIN"]}>
              <AdminTicketsPage />
            </RequireAuth>
          }
        />
      </Route>

      <Route path="/403" element={<ForbiddenPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
