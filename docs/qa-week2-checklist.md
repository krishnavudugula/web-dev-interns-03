
# Week 2 QA Checklist

## 1. Authentication and Authorization

- [ ] Login with valid credentials.
- [ ] Reject invalid credentials.
- [ ] Reject protected requests without a token.
- [ ] Reject expired tokens.
- [ ] Verify HR permissions.
- [ ] Verify ADMIN permissions.
- [ ] Verify CANDIDATE permissions.

## 2. Candidate Profile

- [ ] Retrieve candidate profile.
- [ ] Update candidate profile.
- [ ] Reject invalid phone numbers.
- [ ] Reject unsupported fields.
- [ ] Reject empty updates.
- [ ] Ensure candidates cannot modify another candidate's profile.

## 3. Resume Upload

- [ ] Upload valid PDF.
- [ ] Upload valid DOC.
- [ ] Upload valid DOCX.
- [ ] Reject unsupported file types.
- [ ] Reject files larger than 5 MB.
- [ ] Reject unauthenticated uploads.
- [ ] Verify protected resume downloads.

## 4. Job Management

- [ ] Create a job.
- [ ] Edit a job.
- [ ] Publish a job.
- [ ] Close a job.
- [ ] Archive a job.
- [ ] Reject invalid job data.
- [ ] Ensure public users cannot view drafts.
- [ ] Ensure HR can view drafts.

## 5. Pipeline

- [ ] Perform a valid transition.
- [ ] Reject an invalid transition.
- [ ] Reject changes to final statuses.
- [ ] Reject candidate attempts to change stages.
- [ ] Verify audit record creation.
- [ ] Verify failed transitions do not create successful audit records.

## 6. Search and Pagination

- [ ] Search by job.
- [ ] Search by stage.
- [ ] Search by candidate name.
- [ ] Search by email.
- [ ] Filter by date.
- [ ] Navigate between pages.
- [ ] Verify total result count.
- [ ] Verify empty search results.
- [ ] Reject invalid filter values.
- [ ] Reject invalid pagination parameters.

## 7. Frontend

- [ ] Verify loading states.
- [ ] Verify empty states.
- [ ] Verify error states.
- [ ] Verify 401 handling.
- [ ] Verify 403 handling.
- [ ] Verify form validation.
- [ ] Verify pagination.
- [ ] Verify resume upload feedback.
- [ ] Verify application submission feedback.

## 8. Final Integration

- [ ] Run backend tests.
- [ ] Run frontend build.
- [ ] Verify database connection.
- [ ] Verify seed data.
- [ ] Verify API integration.
- [ ] Verify all routes.
- [ ] Confirm main branch remains runnable.
