# Project Documentation Index (Consolidated)

This project documentation has been reduced to a small, maintainable set of source-of-truth files.

## Keep These Core Files

1. [README.md](README.md)
   - Project setup, run instructions, and general overview.

2. [FRONTEND_DOCUMENTATION_COMPLETE.md](FRONTEND_DOCUMENTATION_COMPLETE.md)
   - Frontend architecture and component documentation summary.

3. [BACKEND_API_DOCUMENTATION.md](BACKEND_API_DOCUMENTATION.md)
   - Full backend API reference (auth, courses, enrollments, lessons, assignments, comments).

4. [FRONTEND_BACKEND_INTEGRATION.md](FRONTEND_BACKEND_INTEGRATION.md)
   - End-to-end integration flows and frontend/backend interaction patterns.

5. [CHANGES_SUMMARY.md](CHANGES_SUMMARY.md)
   - Historical change log and implementation notes.

## Why This Reduced Set Works

- Eliminates duplicated progress/status reports.
- Keeps one clear reference per concern (frontend, backend API, integration, change history).
- Improves discoverability and maintenance.

## Documentation Impact

No loss of essential documentation quality as long as the core files above are maintained.

## Maintenance Rule

When making changes:

- Update [BACKEND_API_DOCUMENTATION.md](BACKEND_API_DOCUMENTATION.md) for API contract changes.
- Update [FRONTEND_DOCUMENTATION_COMPLETE.md](FRONTEND_DOCUMENTATION_COMPLETE.md) for frontend architecture/component changes.
- Update [FRONTEND_BACKEND_INTEGRATION.md](FRONTEND_BACKEND_INTEGRATION.md) when data flow or auth integration changes.
- Append notable updates to [CHANGES_SUMMARY.md](CHANGES_SUMMARY.md).
