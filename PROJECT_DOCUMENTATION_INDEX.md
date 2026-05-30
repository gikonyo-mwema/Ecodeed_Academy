# Project Documentation Index

This project documentation is maintained as a small, focused set of source-of-truth files.

## Core Files

1. [README.md](README.md)
   - Project setup, run instructions, environment variables, and general overview.

2. [BACKEND_API_DOCUMENTATION.md](BACKEND_API_DOCUMENTATION.md)
   - Full backend API reference (auth, courses, enrollments, lessons, assignments, payments, comments, newsletter).

3. [FRONTEND_BACKEND_INTEGRATION.md](FRONTEND_BACKEND_INTEGRATION.md)
   - End-to-end integration flows, Redux patterns, and frontend/backend interaction details.

## Maintenance Rules

When making changes:

- Update [BACKEND_API_DOCUMENTATION.md](BACKEND_API_DOCUMENTATION.md) for any API contract changes (new endpoints, request/response shape, auth changes).
- Update [FRONTEND_BACKEND_INTEGRATION.md](FRONTEND_BACKEND_INTEGRATION.md) when data flow, auth integration, or Redux state shape changes.
- Update [README.md](README.md) for infrastructure, environment variable, or setup changes.
