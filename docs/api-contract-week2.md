
# Week 2 API Contract

## 1. Authentication

All protected endpoints require:

Authorization: Bearer <token>

## 2. Candidate Profile APIs

### Get Candidate Profile

GET /api/candidates/me

Access: CANDIDATE

Success: 200

### Update Candidate Profile

PATCH /api/candidates/me

Access: CANDIDATE

Example request:

{
  "headline": "Frontend Developer",
  "phone": "9876543210",
  "location": "Tamil Nadu",
  "bio": "Computer Science student"
}

Success: 200

## 3. Job APIs

| Method | Endpoint | Access |
|---|---|---|
| GET | /api/jobs | Public |
| GET | /api/jobs/:id | Public |
| POST | /api/jobs | HR, ADMIN |
| PATCH | /api/jobs/:id | HR, ADMIN |
| POST | /api/jobs/:id/publish | HR, ADMIN |
| POST | /api/jobs/:id/close | HR, ADMIN |
| POST | /api/jobs/:id/archive | HR, ADMIN |

Public users must only see published jobs.

HR and ADMIN can access drafts.

## 4. Pipeline APIs

### Change Application Stage

PATCH /api/applications/:id/status

Access: HR, ADMIN

Example request:

{
  "status": "SCREENING",
  "reason": "Initial screening completed"
}

The API must validate the transition and create an audit record.

## 5. HR Search API

GET /api/applications/search

Access: HR, ADMIN

Supported query parameters:

- jobId
- stage
- name
- email
- fromDate
- toDate
- page
- limit

Example:

GET /api/applications/search?stage=SCREENING&page=1&limit=10

Example response:

{
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 0,
    "totalPages": 0
  }
}

Invalid filters return HTTP 400.

## 6. Resume APIs

The existing resume upload and download endpoints must be retained.

Access rules:

- Candidate can upload their own resume.
- Candidate can access their own resume.
- HR and ADMIN can access resumes according to application permissions.

The exact route and multipart field name must match the existing resume router.

## 7. Application Submission

Use the existing application submission endpoint.

Access: CANDIDATE

The backend must verify that the job is published and open.

## 8. Error Response

All endpoints should use the common error structure:

{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request",
    "details": []
  }
}

## 9. Authentication Errors

401:

{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required"
  }
}

403:

{
  "error": {
    "code": "FORBIDDEN",
    "message": "You do not have permission to perform this action"
  }
}
