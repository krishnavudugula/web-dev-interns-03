
# Application Status Transition Rules

## 1. Purpose

This document defines the allowed application status transitions, the roles permitted to perform them, and the audit information that must be recorded.

## 2. Application Statuses

The proposed application stages are:

- APPLIED
- SCREENING
- SHORTLISTED
- INTERVIEW
- OFFER
- HIRED
- REJECTED
- WITHDRAWN

The implementation must use the exact status values defined by the backend.

## 3. Allowed Transitions

| Current Status | Next Status |
|---|---|
| APPLIED | SCREENING |
| APPLIED | REJECTED |
| SCREENING | SHORTLISTED |
| SCREENING | REJECTED |
| SHORTLISTED | INTERVIEW |
| SHORTLISTED | REJECTED |
| INTERVIEW | OFFER |
| INTERVIEW | REJECTED |
| OFFER | HIRED |
| OFFER | REJECTED |

HIRED, REJECTED and WITHDRAWN are final statuses.

No transition is allowed from a final status.

## 4. Role Permissions

| Role | Permission |
|---|---|
| HR | View applications and change application stages |
| ADMIN | View applications and change application stages |
| CANDIDATE | View own application status |
| CANDIDATE | Cannot change application status |

Only HR and ADMIN can perform pipeline transitions.

## 5. Validation Rules

1. The application must exist.
2. The requested status must be valid.
3. The current and requested statuses must form an allowed transition.
4. Only HR and ADMIN can perform transitions.
5. Final statuses cannot be changed.
6. Invalid transitions must return HTTP 400.
7. Unauthorized requests must return HTTP 401.
8. Forbidden role access must return HTTP 403.
9. Missing applications must return HTTP 404.

## 6. Audit Requirements

Every successful status change must create an audit record containing:

- Application ID
- Previous status
- New status
- User ID of the person performing the change
- Timestamp
- Optional reason or comment

Failed transitions must not create successful transition audit records.

## 7. Data Consistency

The application status update and audit record insertion should happen in the same database transaction.

If either operation fails, both operations must be rolled back.

## 8. Final Statuses

The following statuses are final:

- HIRED
- REJECTED
- WITHDRAWN

A final status cannot be changed through the normal pipeline transition API.
