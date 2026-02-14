# AFSA Frontend - Improvement Backlog

> Generated: 2026-02-14
> Last Updated: 2026-02-14

This document tracks identified improvements for the AFSA Membership Portal frontend codebase.

---

## Priority Legend

- 🔴 **Critical** - Security issues, stability concerns, must fix
- 🟠 **High** - Code quality, maintainability issues
- 🟡 **Medium** - Performance, developer experience
- 🟢 **Recommended** - Nice to have, long-term maintenance

---

## 🔴 Critical Priority (Security & Stability)

### 1. Centralize API calls using ApiClient
- **Status:** `[ ] Not Started`
- **Impact:** High
- **Problem:** 90 raw `fetch()` calls bypass the existing ApiClient class
- **Solution:** Migrate all hooks to use `/src/lib/api-client.ts`
- **Files:** All hooks in `/src/lib/hooks/`
- **Estimate:** 2-3 hours

### 2. Add Error Boundary component
- **Status:** `[ ] Not Started`
- **Impact:** High
- **Problem:** No global error handling, app can crash on failures
- **Solution:** Create ErrorBoundary component, wrap layouts
- **Files:** New component + layout wrapping
- **Estimate:** 1 hour

### 3. Fix token storage security
- **Status:** `[ ] Not Started`
- **Impact:** Critical
- **Problem:** JWT in localStorage vulnerable to XSS attacks
- **Solution:** Move to HttpOnly cookies (requires backend changes)
- **Files:** `auth-service.ts`, all auth hooks
- **Estimate:** Backend coordination required

### 4. Add input validation with Zod
- **Status:** `[ ] Not Started`
- **Impact:** High
- **Problem:** No runtime validation of API responses or form inputs
- **Solution:** Add Zod schemas for API responses and form validation
- **Files:** All forms, API transformations
- **Estimate:** 4-5 hours

### 5. Consolidate ROLE_PERMISSIONS
- **Status:** `[ ] Not Started`
- **Impact:** High
- **Problem:** Duplicate definitions causing inconsistent permission checks
- **Location 1:** `/src/types/index.ts` (54 permissions)
- **Location 2:** `/src/lib/hooks/useRoleAccess.ts` (8 permissions)
- **Solution:** Single source of truth in types/index.ts
- **Estimate:** 30 minutes

---

## 🟠 High Priority (Code Quality)

### 6. Create BaseModal component
- **Status:** `[ ] Not Started`
- **Impact:** Medium
- **Problem:** 13 modals duplicate same pattern (800+ lines wasted)
- **Files:** `/src/components/admin/modals/*`
- **Solution:** Extract shared modal wrapper with slots for header/body/footer
- **Estimate:** 2 hours

### 7. Standardize form components
- **Status:** `[ ] Not Started`
- **Impact:** Medium
- **Problem:** Input patterns repeated 50+ times across modals
- **Solution:** Create FormInput, FormSelect, FormTextarea components
- **Files:** All modal/form components
- **Estimate:** 2-3 hours

### 8. Remove `any` types
- **Status:** `[ ] Not Started`
- **Impact:** Medium
- **Problem:** 62 instances of `: any` reducing type safety
- **Files:** Various (search for `: any`)
- **Solution:** Add proper type definitions
- **Estimate:** 2 hours

### 9. Remove @ts-ignore comments
- **Status:** `[ ] Not Started`
- **Impact:** Medium
- **Problem:** 15 type ignores hiding real type issues
- **Files:**
  - `/src/components/dashboard/secure-dashboard-layout.tsx`
  - `/src/components/dashboard/board-dashboard.tsx`
  - `/src/components/ui/BaseTable.tsx`
  - `/src/lib/utils/certificateGenerator.ts`
- **Estimate:** 1-2 hours

### 10. Create reusable StatusBadge component
- **Status:** `[ ] Not Started`
- **Impact:** Low
- **Problem:** Status color logic duplicated in multiple components
- **Duplicated in:**
  - `MemberApplicationSheet.tsx` (getStatusConfig)
  - `formatters.ts` (getStatusColor)
  - Various client components
- **Solution:** Single StatusBadge component with status prop
- **Estimate:** 1 hour

---

## 🟡 Medium Priority (Performance & DX)

### 11. Add loading skeletons as reusable components
- **Status:** `[ ] Not Started`
- **Impact:** Medium
- **Problem:** Each page reimplements loading UI inline
- **Solution:** Create `/src/components/ui/Skeleton.tsx` with variants
- **Estimate:** 1-2 hours

### 12. Implement code splitting
- **Status:** `[ ] Not Started`
- **Impact:** Medium
- **Problem:** Admin features loaded for all users
- **Solution:** Dynamic imports for admin-only routes/components
- **Files:** Admin routes, heavy components
- **Estimate:** 2 hours

### 13. Add memoization
- **Status:** `[ ] Not Started`
- **Impact:** Medium
- **Problem:** Only 5 useMemo instances, many potential re-render issues
- **Files:** Large components with computed values
- **Solution:** Add useMemo/useCallback where appropriate
- **Estimate:** 2 hours

### 14. Standardize date formatting
- **Status:** `[ ] Not Started`
- **Impact:** Low
- **Problem:** Multiple formatDate implementations with inconsistent behavior
- **Duplicated in:**
  - `formatters.ts` (line 5-13)
  - `MemberApplicationSheet.tsx` (line 147-150)
  - Various components
- **Solution:** Single formatDate utility with options
- **Estimate:** 30 minutes

### 15. Create useApiRequest hook
- **Status:** `[ ] Not Started`
- **Impact:** High
- **Problem:** Loading/error/data pattern duplicated in 27 hooks
- **Pattern:**
  ```typescript
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // ... fetch logic with try/catch/finally
  ```
- **Solution:** Generic useApiRequest hook handling common patterns
- **Estimate:** 2 hours

---

## 🟢 Recommended (Maintenance)

### 16. Add unit tests
- **Status:** `[ ] Not Started`
- **Impact:** High
- **Problem:** Zero test coverage - no .test.ts or .spec.ts files
- **Priority areas:**
  - Authentication flow (useAuth.ts)
  - Permission checking (useRoleAccess.ts)
  - API client retry logic
  - Form validation
- **Solution:** Setup Jest + Testing Library
- **Estimate:** Ongoing effort

### 17. Add accessibility attributes
- **Status:** `[ ] Not Started`
- **Impact:** Medium
- **Problem:** No ARIA labels, missing semantic HTML
- **Missing:**
  - aria-label, aria-labelledby, aria-describedby
  - Proper nav elements
  - Skip links
  - Form input associations
- **Estimate:** 3-4 hours

### 18. Add CSP headers
- **Status:** `[ ] Not Started`
- **Impact:** Medium
- **Problem:** No Content Security Policy configured
- **File:** `next.config.ts`
- **Solution:** Add security headers configuration
- **Estimate:** 1 hour

### 19. Document API contracts
- **Status:** `[ ] Not Started`
- **Impact:** Low
- **Problem:** No documentation of API response structures
- **Solution:** JSDoc comments or separate docs
- **Estimate:** Ongoing

### 20. Add prefers-reduced-motion support
- **Status:** `[ ] Not Started`
- **Impact:** Low
- **Problem:** Animations without motion preference check
- **Solution:** CSS media query or useReducedMotion hook
- **Estimate:** 1 hour

---

## Quick Wins (< 30 min each)

- [ ] Remove unused imports across codebase
- [ ] Add missing optional chaining for API responses
- [ ] Fix inconsistent file naming (Resourcemodal.tsx → ResourceModal.tsx)
- [ ] Remove console.log statements (156 found)
- [ ] Add missing TypeScript return types to functions

---

## Architecture Improvements (Larger Effort)

| Current State | Target State | Effort |
|--------------|--------------|--------|
| 90 raw fetch() calls | Single ApiClient usage | High |
| 461 duplicate toast patterns | useApiRequest hook | Medium |
| 13 separate modals | BaseModal + specific content | Medium |
| No tests | Jest + Testing Library setup | High |
| localStorage tokens | HttpOnly cookies | Backend required |

---

## Completed Improvements

| # | Improvement | Date | PR/Commit |
|---|-------------|------|-----------|
| - | Initial codebase setup | - | - |

---

## Notes

- Backend coordination required for items: #3 (token storage)
- Items #1, #6, #15 provide highest ROI for code quality
- Security items (#1-#5) should be prioritized before new features
