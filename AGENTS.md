# Architecture Decisions

- Responsive behavior is implemented mobile-first in shared layout and UI primitives, with page-specific adaptations only where content structure differs; this keeps every route usable without duplicating viewport logic.
- Sidebar navigation uses the shared Sidebar primitives and sidebar theme tokens, with wallet grouping kept in AppSidebar; this preserves collapse and mobile navigation without changing routes.