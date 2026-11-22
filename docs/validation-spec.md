
# Week 2 Validation Specification

## 1. Purpose

This document defines the validation rules shared by the backend and frontend.

Both sides must use consistent field limits, upload restrictions and error formats.

## 2. Candidate Profile

| Field | Rule |
|---|---|
| Headline | Maximum 120 characters |
| Bio | Maximum 1000 characters |
| Phone | 10–15 digits, optional + prefix |
| Location | Maximum 100 characters |
| Skills | Maximum 20 skills |
| Each skill | Maximum 50 characters |
| Portfolio URL | Must be a valid HTTP/HTTPS URL |
| LinkedIn URL | Must be a valid HTTP/HTTPS URL |
| GitHub URL | Must be a valid HTTP/HTTPS URL |

## 3. Job Details

| Field | Rule |
|---|---|
| Job title | Required, 3–120 characters |
| Description | Required, maximum 10000 characters |
| Location | Maximum 150 characters |
| Employment type | Must match an allowed employment type |
| Experience | Must be a non-negative number |
| Salary minimum | Must be non-negative |
| Salary maximum | Must be greater than or equal to minimum |
| Skills | Maximum 30 skills |

## 4. Resume Upload

Allowed file types:

- PDF
- DOC
- DOCX

Maximum file size: 5 MB.

The backend must:

1. Validate the file extension.
2. Validate the MIME type.
3. Verify the file content where possible.
4. Generate a unique server-side filename.
5. Store files outside the public static directory.
6. Prevent executable files from being uploaded.
7. Allow only authorized users to access protected resumes.

The frontend must check the file type and size before submission.

Frontend validation does not replace backend validation.

## 5. Application Submission

- Candidate must be authenticated.
- Job must exist.
- Job must be published and open.
- Candidate cannot apply to the same job more than once.
- Resume must satisfy the upload rules when required.

## 6. Search Filters

Supported filters:

- Job ID
- Application stage
- Candidate name
- Candidate email
- Application date range

Invalid filter values must return HTTP 400.

Pagination:

- Default page: 1
- Default limit: 10
- Maximum limit: 100
- Page must be a positive integer.
- Limit must be a positive integer.

## 7. Standard Error Format

All API validation errors should use a consistent response structure:

{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Please check the submitted fields.",
    "details": []
  }
}

## 8. Expected HTTP Status Codes

| Status | Meaning |
|---|---|
| 200 | Successful request |
| 201 | Resource created |
| 400 | Invalid input |
| 401 | Authentication required |
| 403 | Permission denied |
| 404 | Resource not found |
| 409 | Duplicate or conflicting request |
| 413 | File too large |
| 500 | Internal server error |

## 9. Example Validation Messages

- Job title is required.
- Invalid email address.
- Phone number must contain 10–15 digits.
- Resume must be PDF, DOC or DOCX.
- Resume size must not exceed 5 MB.
- Invalid application status.
- Invalid pagination parameters.
- Candidate has already applied for this job.
