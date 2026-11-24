# Personnel services update
- tasks: personal assigned documents, returned documents, ready requests, returned training; HR counts and request queue.
- directory: HR/ADMIN only, search and export visible rows as UTF-8 CSV for Excel. Registered profiles are self-reported, not an official staffing register.
- training: staff submit, HR/ADMIN review only other people's pending records, return reason required, staff can withdraw only pending own record.
- ADMIN account search.
- No payroll calculations, automatic salary certificates, official leave entitlement, eDoc, or changes to existing authentication.
- Training storage uses hr_training_records from the existing personnel_development_records_with_hr_review migration; RLS and column grants are enforced.
- Notifications are calculated when data is loaded/refreshed, not email/push.
