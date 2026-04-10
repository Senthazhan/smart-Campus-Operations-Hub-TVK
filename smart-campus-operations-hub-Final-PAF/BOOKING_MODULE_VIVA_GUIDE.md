# Booking Module Viva Guide

## Student Scope

This document explains **my individual contribution** to the Smart Campus Operations Hub project for **Module B - Booking Management**. It is written for viva preparation based on the assignment brief and marking rubric.

According to the assignment brief, Module B requires:

- users can request a booking by providing `date`, `time range`, `purpose`, and `expected attendees`
- bookings must follow the workflow `PENDING -> APPROVED / REJECTED`
- approved bookings can later become `CANCELLED`
- the system must prevent scheduling conflicts for the same resource
- admin users can review, approve, or reject booking requests with a reason
- users can view their own bookings
- admin can view all bookings with filters

My implementation covers those core requirements and also adds several practical enhancements:

- edit support for pending bookings
- past-date and same-day past-time prevention
- attendee-capacity-aware resource filtering
- resource operating-hours validation
- stale pending booking expiry
- improved conflict messages
- user booking details modal
- user QR generation for approved bookings
- time fit preview for booking selection

---

## 1. Module Objective

The purpose of my module is to manage the **full booking lifecycle** for campus resources such as labs, meeting rooms, seminar rooms, lecture halls, and equipment-enabled spaces.

The module ensures that:

- only valid booking requests are accepted
- two users cannot reserve the same resource for overlapping time periods
- admins can review requests through a controlled workflow
- users can track, edit, cancel, and understand the status of their requests
- resource capacity and operating hours are respected
- the system maintains clear auditability through statuses, reasons, and timestamps

This directly supports the business scenario in the assignment brief: a university needs a centralized platform to manage facility and asset bookings with strong workflow control and auditability.

---

## 2. Tech Integration

My module is built across both the **Spring Boot backend** and the **React frontend**.

### Backend role

The backend handles:

- booking creation
- booking update
- booking approval
- booking rejection
- booking cancellation
- booking retrieval and listing
- overlap conflict detection
- capacity validation
- operating-hours validation
- ownership and role checks
- stale booking expiry
- API response construction

### Frontend role

The frontend handles:

- booking request form
- edit booking form
- resource filtering
- resource selection UI
- time fit preview UI
- user booking history UI
- booking detail modal
- QR code modal for approved bookings
- booking sort/filter controls
- warning and error messaging

---

## 3. Main Business Workflow

### 3.1 Create Booking

User flow:

1. User opens the booking request page.
2. User filters resources if needed.
3. User selects date, time, and attendee count.
4. Frontend requests matching resources from backend.
5. User selects an available resource.
6. User enters purpose and notes.
7. User submits the request.
8. Backend validates the request and stores it as `PENDING`.

### 3.2 Review Booking

Admin flow:

1. Admin opens the admin bookings page.
2. Admin reviews pending requests.
3. Admin approves or rejects with a reason.
4. Backend updates the status and saves reviewer metadata.
5. Notification is sent to the user.

### 3.3 Edit Pending Booking

User flow:

1. User opens `My Bookings`.
2. Only `PENDING` bookings show the `Edit` action.
3. Existing booking values load into the booking form.
4. User changes details.
5. Backend validates again.
6. Updated request remains `PENDING`.

### 3.4 Cancel Booking

Cancellation flow:

1. User or admin cancels a booking.
2. Backend checks that the status is eligible.
3. Booking becomes `CANCELLED`.
4. It no longer blocks future bookings.

### 3.5 Expiry of Stale Pending Bookings

If a booking remains `PENDING` after its end time has passed:

- backend automatically marks it as `EXPIRED`
- this prevents stale pending bookings from blocking resources forever
- it also keeps the queue cleaner for admin review

---

## 4. Booking Status Lifecycle

The booking lifecycle currently includes:

- `PENDING`
- `APPROVED`
- `REJECTED`
- `CANCELLED`
- `EXPIRED`

### Status meanings

- `PENDING`: newly submitted and waiting for admin review
- `APPROVED`: accepted by admin
- `REJECTED`: declined by admin with reason
- `CANCELLED`: cancelled by user or admin after being pending or approved
- `EXPIRED`: not reviewed before its time passed

### Why this is important

This makes the booking system more realistic and more auditable than a simple create/delete model.

---

## 5. Core Backend Logic

The most important backend file in my module is:

- [BookingServiceImpl.java](C:/Users/User/Desktop/PAF%20Project/smart-Campus-Operations-Hub-TVK/smart-campus-operations-hub-Final-PAF/backend/src/main/java/com/smartcampus/service/impl/BookingServiceImpl.java)

This file contains nearly all of the booking business rules.

### 5.1 Request Validation

Before a booking is created or updated, the backend validates:

- booking date is not in the past
- same-day booking must start in the future
- `startTime` must be before `endTime`
- resource must exist
- resource must be active
- expected attendees must not exceed capacity
- requested slot must be inside resource operating hours
- there must be no overlapping booking conflict

### 5.2 Capacity Validation

Capacity validation is **separate** from overlap validation.

Rule:

- `expectedAttendees <= resource.capacity`

Important point for viva:

- even if attendees are within capacity, overlapping bookings are still rejected
- a room is treated as an exclusive resource, not as shared seating

### 5.3 Operating Hours Validation

The system validates against the resource's:

- `availableFrom`
- `availableTo`

This means:

- booking cannot start before the resource becomes available
- booking cannot end after the resource becomes unavailable

### 5.4 Conflict Detection

This is the most critical logic in my module.

Two bookings overlap if:

`existing.startTime < new.endTime && new.startTime < existing.endTime`

The system only treats a booking as conflicting if all of the following are true:

- same `resource.id`
- same `bookingDate`
- status is `PENDING` or `APPROVED`
- time ranges overlap

Ignored from blocking:

- `CANCELLED`
- `REJECTED`
- `EXPIRED`

### 5.5 Why Conflict Detection Was Hard

Initially, a fragile reference comparison problem could happen because Mongo relationships should not be trusted via direct object reference equality. The correct approach was to compare:

- actual `resource.id`
- date
- overlap condition
- eligible statuses

This made conflict detection stable across create, update, and approve flows.

### 5.6 Update Logic

For booking edits:

- only `PENDING` bookings can be edited
- ownership or admin privileges are checked
- the current booking is excluded from conflict search
- the updated values are fully revalidated

### 5.7 Approval Logic

Approval is not just a status change.

Before approval:

- backend rechecks conflicts against already `APPROVED` bookings

This protects against a stale case like:

1. booking A is pending
2. booking B later gets approved for same resource and slot
3. admin tries to approve booking A

The backend correctly blocks this.

### 5.8 Cancellation Logic

Cancellation is allowed only for:

- `PENDING`
- `APPROVED`

If already cancelled, it simply returns the existing booking.

### 5.9 Expiry Logic

Expired pending bookings are handled by:

- checking if `bookingDate + endTime` is before `now`
- marking such pending bookings as `EXPIRED`
- attaching a default decision reason if missing

This protects the system from stale unresolved requests.

---

## 6. Core Frontend Logic

The most important frontend files in my module are:

- [BookingRequestPage.jsx](C:/Users/User/Desktop/PAF%20Project/smart-campus-operations-hub-Final-PAF/frontend/src/pages/BookingRequestPage.jsx)
- [MyBookingsPage.jsx](C:/Users/User/Desktop/PAF%20Project/smart-campus-operations-hub-Final-PAF/frontend/src/pages/MyBookingsPage.jsx)

### 6.1 Booking Request Page

This page supports:

- filtering resources by type, building, search, and minimum capacity
- entering schedule information
- attendee-aware resource filtering
- selecting a resource
- previewing whether a chosen time fits
- entering purpose and notes
- create mode and edit mode
- displaying validation and warning messages

### 6.2 Expected Attendees Integration

One important improvement I made is:

- the entered `Expected Attendees` value now directly affects which resources are shown

This means:

- if user enters `20`, resources with capacity `5` or `15` are not shown
- the system uses the higher of:
  - expected attendees
  - manual minimum capacity filter

This makes resource selection logically correct.

### 6.3 Edit Mode

The same booking form is reused for:

- new booking creation
- editing a pending booking

When editing:

- existing data is loaded from backend
- current booking is excluded from preview conflict checks
- only pending bookings can be edited

### 6.4 My Bookings Page

This page supports:

- viewing own bookings
- sort order:
  - latest to oldest
  - oldest to latest
- booking view:
  - hide cancelled
  - show all
- status filter:
  - pending
  - approved
  - rejected
  - cancelled
  - expired
- viewing booking details
- QR generation for approved bookings
- cancelling pending/approved bookings

### 6.5 Booking Details Modal

The user can open a detailed modal showing:

- resource
- booking date
- time
- attendees
- purpose
- notes
- decision reason
- decided by
- decided at
- created at
- updated at
- booking id

This supports auditability and helps explain the lifecycle clearly.

### 6.6 QR Generation

For approved bookings:

- the user can open a QR modal
- download the QR image
- the QR encodes booking details as a booking pass

This was added as an innovation-oriented enhancement.

---

## 7. Time Fit Preview Feature

This feature lives in:

- [BookingRequestPage.jsx](C:/Users/User/Desktop/PAF%20Project/smart-campus-operations-hub-Final-PAF/frontend/src/pages/BookingRequestPage.jsx)
- [ResourceTimeFitPreviewResponse.java](C:/Users/User/Desktop/PAF%20Project/smart-campus-operations-hub-Final-PAF/backend/src/main/java/com/smartcampus/dto/response/ResourceTimeFitPreviewResponse.java)
- [ResourceServiceImpl.java](C:/Users/User/Desktop/PAF%20Project/smart-campus-operations-hub-Final-PAF/backend/src/main/java/com/smartcampus/service/impl/ResourceServiceImpl.java)

### Purpose

It visually explains whether the user's selected time is suitable for a given resource.

### What it now checks

For each resource, backend returns a preview verdict:

- `AVAILABLE`
- `OUTSIDE_HOURS`
- `BOOKING_CONFLICT`
- `SCHEDULE_REQUIRED`

### What the user sees

- green bar = room's normal bookable hours
- blue bar = user's chosen slot
- red blocked area = existing booking conflict
- text reason below each row

Examples:

- "This resource is available for the selected time."
- "Your chosen time is outside this resource's allowed booking hours."
- "This resource already has a PENDING booking from 10:00 to 12:00."

### Why this matters

Without this, the preview would only look nice visually but would not be logically meaningful.

Now it is backed by actual backend evaluation.

---

## 8. Resource Integration

My module depends on the resource module for:

- resource name
- code
- type
- building
- floor
- room number
- capacity
- availability window
- active status

Important resource-related files:

- [Resource.java](C:/Users/User/Desktop/PAF%20Project/smart-campus-operations-hub-Final-PAF/backend/src/main/java/com/smartcampus/entity/Resource.java)
- [ResourceController.java](C:/Users/User/Desktop/PAF%20Project/smart-campus-operations-hub-Final-PAF/backend/src/main/java/com/smartcampus/controller/ResourceController.java)
- [ResourceService.java](C:/Users/User/Desktop/PAF%20Project/smart-campus-operations-hub-Final-PAF/backend/src/main/java/com/smartcampus/service/ResourceService.java)
- [ResourceServiceImpl.java](C:/Users/User/Desktop/PAF%20Project/smart-campus-operations-hub-Final-PAF/backend/src/main/java/com/smartcampus/service/impl/ResourceServiceImpl.java)

The booking module cannot function correctly without this integration because the resource module provides the constraints that bookings must obey.

---

## 9. Authentication and Authorization Integration

My module also integrates with authentication and role management.

### User access

Regular users can:

- create bookings
- edit their own pending bookings
- cancel their own eligible bookings
- view only their own bookings

### Admin access

Admins can:

- view all bookings
- approve bookings
- reject bookings
- cancel bookings

### Security logic

This is enforced in backend service logic and controller security annotations.

Examples:

- user cannot edit another user's booking
- admin-only approval/rejection is enforced
- ownership is checked for get/update/cancel

---

## 10. Notification Integration

My module integrates with the notification module.

Notifications are triggered for:

- booking submitted
- booking approved
- booking rejected
- booking cancelled

This is important because the assignment explicitly requires notifications for booking approval/rejection and related workflow changes.

---

## 11. REST API Contribution

The assignment states that each member should contribute at least four REST endpoints using different HTTP methods.

My module clearly satisfies that through booking endpoints such as:

- `POST /api/v1/bookings`
- `PUT /api/v1/bookings/{id}`
- `GET /api/v1/bookings`
- `GET /api/v1/bookings/{id}`
- `PATCH /api/v1/bookings/{id}/approve`
- `PATCH /api/v1/bookings/{id}/reject`
- `PATCH /api/v1/bookings/{id}/cancel`

This demonstrates:

- proper endpoint naming
- multiple HTTP methods
- state-changing workflow endpoints
- resource-oriented API design

---

## 12. Mapping to Marking Rubric

Based on the rubric, these are the strongest areas of my module:

### REST API

- resource-oriented endpoint naming is clear
- multiple HTTP methods are used appropriately
- business rules are enforced in backend, not only frontend
- validation and conflict handling are substantial

### Client Web Application

- booking request page is structured by steps
- user booking history is usable and feature-rich
- admin approval flow is integrated
- UI includes functional enhancements, not just CRUD forms

### Innovation / Creativity

My additions that support innovation include:

- QR code for approved booking pass
- booking details modal
- time fit preview with real conflict reasoning
- attendee-aware intelligent resource filtering

### Documentation Readiness

This module is explainable from:

- entity level
- controller level
- service/business-logic level
- UI level
- workflow level

which is exactly what the viva panel is likely to test.

---

## 13. Strong Viva Answers

### If asked: "What exactly is your module?"

You can answer:

> My module is the Booking Management module. It handles resource booking requests, booking workflow transitions, conflict prevention for overlapping reservations, capacity validation, resource availability validation, admin approval/rejection, user booking history, edit support for pending bookings, cancellation, expiry of stale pending bookings, and frontend features like QR generation and time-fit preview.

### If asked: "How do you prevent double booking?"

You can answer:

> I prevent double booking in the backend by checking for bookings with the same resource, same date, and overlapping time range. Only bookings in PENDING or APPROVED state are treated as blockers. If overlap is found, the backend throws a conflict exception and rejects the request.

### If asked: "How do you use expected attendees?"

You can answer:

> Expected attendees is validated in two ways. First, the backend ensures it does not exceed the selected resource capacity. Second, the frontend uses that number to filter the visible resources so the user only sees rooms that can actually support the group size.

### If asked: "How is edit handled?"

You can answer:

> Only pending bookings can be edited. When editing, the current booking is excluded from conflict detection so it does not block itself, but all other rules still apply, including overlap checks, capacity checks, and operating-hour checks.

### If asked: "Why do you recheck conflict during approval?"

You can answer:

> Because a booking can be created earlier as pending, and later another booking can be approved for the same slot. If admin tries to approve the older pending request afterwards, the backend must recheck conflict and block the approval. Otherwise the system can end up with two approved bookings for the same room and time.

### If asked: "What is the purpose of the Time Fit Preview?"

You can answer:

> It helps the user understand whether their chosen slot is logically suitable for each resource. It is not just a visual timeline; the backend returns whether the slot is available, outside operating hours, or blocked by another booking, and the UI shows the reason clearly.

### If asked: "How is your work integrated with other team members' modules?"

You can answer:

> My module integrates with the resource module for room metadata, capacity, and operating hours; with the auth module for ownership and role-based access; with the notification module for workflow alerts; and with the admin module for approval and rejection actions.

---

## 14. Files I Must Revise Before Viva

If I only have limited time, I should read these files in this order.

### Highest Priority

1. [BookingServiceImpl.java](C:/Users/User/Desktop/PAF%20Project/smart-campus-operations-hub-Final-PAF/backend/src/main/java/com/smartcampus/service/impl/BookingServiceImpl.java)
2. [BookingRequestPage.jsx](C:/Users/User/Desktop/PAF%20Project/smart-campus-operations-hub-Final-PAF/frontend/src/pages/BookingRequestPage.jsx)
3. [MyBookingsPage.jsx](C:/Users/User/Desktop/PAF%20Project/smart-campus-operations-hub-Final-PAF/frontend/src/pages/MyBookingsPage.jsx)
4. [BookingController.java](C:/Users/User/Desktop/PAF%20Project/smart-campus-operations-hub-Final-PAF/backend/src/main/java/com/smartcampus/controller/BookingController.java)
5. [Booking.java](C:/Users/User/Desktop/PAF%20Project/smart-campus-operations-hub-Final-PAF/backend/src/main/java/com/smartcampus/entity/Booking.java)
6. [BookingStatus.java](C:/Users/User/Desktop/PAF%20Project/smart-campus-operations-hub-Final-PAF/backend/src/main/java/com/smartcampus/enums/BookingStatus.java)

### Second Priority

7. [ResourceServiceImpl.java](C:/Users/User/Desktop/PAF%20Project/smart-campus-operations-hub-Final-PAF/backend/src/main/java/com/smartcampus/service/impl/ResourceServiceImpl.java)
8. [ResourceController.java](C:/Users/User/Desktop/PAF%20Project/smart-campus-operations-hub-Final-PAF/backend/src/main/java/com/smartcampus/controller/ResourceController.java)
9. [ResourceTimeFitPreviewResponse.java](C:/Users/User/Desktop/PAF%20Project/smart-campus-operations-hub-Final-PAF/backend/src/main/java/com/smartcampus/dto/response/ResourceTimeFitPreviewResponse.java)
10. [bookingsApi.js](C:/Users/User/Desktop/PAF%20Project/smart-campus-operations-hub-Final-PAF/frontend/src/api/bookingsApi.js)
11. [resourcesApi.js](C:/Users/User/Desktop/PAF%20Project/smart-campus-operations-hub-Final-PAF/frontend/src/api/resourcesApi.js)
12. [AdminBookingsPage.jsx](C:/Users/User/Desktop/PAF%20Project/smart-campus-operations-hub-Final-PAF/frontend/src/pages/AdminBookingsPage.jsx)

### Quick Revision Checklist

Before viva, I should be able to explain:

- all booking statuses
- create/update/approve/reject/cancel flows
- overlap rule
- capacity rule
- operating-hours rule
- pending edit rule
- expiry logic
- resource filtering by attendee count
- user booking list features
- QR feature
- time fit preview logic
- how my backend and frontend are connected

---

## 15. Honest Current State

The booking module is in a strong state for viva:

- main workflow is implemented
- backend business rules are solid
- frontend and backend are integrated properly
- the module goes beyond minimum CRUD
- the contribution is clearly visible as an individual module

There are still some minor residual edge cases in filtering/query consistency that could be improved later, but they do not change the fact that the **main booking business workflow is functionally complete and logically strong**.

---

## 16. Final Viva Summary

Short summary I can say at the start of viva:

> I implemented Module B - Booking Management. My part includes booking creation, editing pending requests, cancellation, admin approval and rejection, overlap conflict prevention, capacity validation, operating-hours validation, expired pending handling, user booking history, booking details view, approved-booking QR generation, and a time-fit preview that explains whether a selected slot is available or blocked. My module integrates with resources, authentication, notifications, and the admin workflow, and the main business rules are enforced in the Spring Boot service layer.

