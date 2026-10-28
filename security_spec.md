# 4haus Studio — Firestore Security Specification (Phase 0 TDD)

## 1. Data Invariants
1. **Strict Tenant Isolation (`workspaces/{userId}`)**: A workspace document at `/workspaces/{userId}` can ONLY be read, created, or updated by the authenticated user whose `request.auth.uid == userId` and `request.auth.token.email_verified == true`.
2. **Relational Subcollection Sync (`workspaces/{userId}/prospects/{prospectId}`)**: A prospect document in `/workspaces/{userId}/prospects/{prospectId}` can ONLY exist if the parent `/workspaces/{userId}` document exists (`exists()`), belongs to `request.auth.uid`, and `incoming().ownerId == request.auth.uid`.
3. **Immutable Ownership & Temporal Integrity**: `ownerId` and `createdAt` can never be mutated after creation. `createdAt` on create and `updatedAt` on create/update must equal `request.time`.
4. **Terminal State Locking**: Once a prospect reaches `status == 'Descartado'`, no further updates are permitted on that prospect document.

## 2. The "Dirty Dozen" Adversarial Payloads
1. **Unauthenticated Write**: `auth = null`, creating `/workspaces/user_1` -> `PERMISSION_DENIED`.
2. **Unverified Email Spoof**: `auth = { uid: 'user_1', token: { email_verified: false } }`, creating `/workspaces/user_1` -> `PERMISSION_DENIED`.
3. **Identity Spoofing (Cross-Tenant Workspace)**: `auth.uid = 'user_attacker'`, writing to `/workspaces/user_victim` -> `PERMISSION_DENIED`.
4. **Shadow Field Injection on Workspace**: Sending `{ ownerId: 'user_1', businessName: 'X', industry: 'Y', targetLocation: 'Z', updatedAt: request.time, isAdmin: true }` -> `PERMISSION_DENIED` via `hasOnly()`.
5. **Denial-of-Wallet Oversized String**: Sending `businessName` with 5,000 characters (> 160 maxLength) -> `PERMISSION_DENIED`.
6. **ID Poisoning Attack**: Creating `/workspaces/user_1/prospects/invalid$id!with*spaces` -> `PERMISSION_DENIED` via `isValidId()`.
7. **Orphaned Subcollection Write**: Creating `/workspaces/user_1/prospects/p_1` when `/workspaces/user_1` does not exist -> `PERMISSION_DENIED` via `exists()`.
8. **Cross-Tenant PII Leak (Get)**: `auth.uid = 'user_2'` attempting `get(/workspaces/user_1/prospects/p_1)` -> `PERMISSION_DENIED`.
9. **Unauthorized List Scraping**: `auth.uid = 'user_2'` attempting `list(/workspaces/user_1/prospects)` -> `PERMISSION_DENIED` via `resource.data.ownerId == request.auth.uid`.
10. **OwnerId Mutation on Update**: Updating `ownerId` from `'user_1'` to `'user_2'` -> `PERMISSION_DENIED`.
11. **Forged Client Timestamp**: Creating prospect with client timestamp instead of `request.time` -> `PERMISSION_DENIED`.
12. **Terminal State Bypass**: Updating a prospect whose existing `status` is `'Descartado'` -> `PERMISSION_DENIED`.
