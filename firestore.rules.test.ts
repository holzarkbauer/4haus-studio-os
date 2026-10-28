// Phase 0 Security Specification & Adversarial Test Suite for firestore.rules
// Validates that all 12 Dirty Dozen payloads are rejected with PERMISSION_DENIED.

export interface AdversarialPayloadTest {
  id: number;
  name: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete';
  path: string;
  auth: { uid: string; email_verified: boolean } | null;
  payload?: Record<string, unknown>;
  expectedOutcome: 'PERMISSION_DENIED';
}

export const DIRTY_DOZEN_TESTS: AdversarialPayloadTest[] = [
  {
    id: 1,
    name: 'Unauthenticated Write to Workspace',
    operation: 'create',
    path: '/workspaces/user_1',
    auth: null,
    payload: { ownerId: 'user_1', businessName: 'Hack', industry: 'Tech', targetLocation: 'Madrid', updatedAt: 'SERVER_TIME' },
    expectedOutcome: 'PERMISSION_DENIED',
  },
  {
    id: 2,
    name: 'Unverified Email Spoof Attack',
    operation: 'create',
    path: '/workspaces/user_1',
    auth: { uid: 'user_1', email_verified: false },
    payload: { ownerId: 'user_1', businessName: 'Spoof', industry: 'Tech', targetLocation: 'Madrid', updatedAt: 'SERVER_TIME' },
    expectedOutcome: 'PERMISSION_DENIED',
  },
  {
    id: 3,
    name: 'Cross-Tenant Identity Spoofing',
    operation: 'create',
    path: '/workspaces/user_victim',
    auth: { uid: 'user_attacker', email_verified: true },
    payload: { ownerId: 'user_attacker', businessName: 'Cross', industry: 'Tech', targetLocation: 'Madrid', updatedAt: 'SERVER_TIME' },
    expectedOutcome: 'PERMISSION_DENIED',
  },
  {
    id: 4,
    name: 'Shadow Field Injection on Workspace',
    operation: 'create',
    path: '/workspaces/user_1',
    auth: { uid: 'user_1', email_verified: true },
    payload: { ownerId: 'user_1', businessName: 'Valid', industry: 'Tech', targetLocation: 'Madrid', updatedAt: 'SERVER_TIME', isAdmin: true },
    expectedOutcome: 'PERMISSION_DENIED',
  },
  {
    id: 5,
    name: 'Denial-of-Wallet Oversized String',
    operation: 'create',
    path: '/workspaces/user_1',
    auth: { uid: 'user_1', email_verified: true },
    payload: { ownerId: 'user_1', businessName: 'A'.repeat(1000), industry: 'Tech', targetLocation: 'Madrid', updatedAt: 'SERVER_TIME' },
    expectedOutcome: 'PERMISSION_DENIED',
  },
  {
    id: 6,
    name: 'ID Poisoning on Prospect Subcollection',
    operation: 'create',
    path: '/workspaces/user_1/prospects/bad$id!spaces',
    auth: { uid: 'user_1', email_verified: true },
    payload: { ownerId: 'user_1', name: 'Lead', company: 'Co', email: 'a@b.c', channel: 'Email', status: 'Nuevo', temperature: 'Caliente', createdAt: 'SERVER_TIME', updatedAt: 'SERVER_TIME' },
    expectedOutcome: 'PERMISSION_DENIED',
  },
  {
    id: 7,
    name: 'Orphaned Subcollection Write Without Parent Workspace',
    operation: 'create',
    path: '/workspaces/non_existent_user/prospects/p_1',
    auth: { uid: 'non_existent_user', email_verified: true },
    payload: { ownerId: 'non_existent_user', name: 'Lead', company: 'Co', email: 'a@b.c', channel: 'Email', status: 'Nuevo', temperature: 'Caliente', createdAt: 'SERVER_TIME', updatedAt: 'SERVER_TIME' },
    expectedOutcome: 'PERMISSION_DENIED',
  },
  {
    id: 8,
    name: 'Cross-Tenant PII Leak on Prospect Get',
    operation: 'get',
    path: '/workspaces/user_1/prospects/p_1',
    auth: { uid: 'user_2', email_verified: true },
    expectedOutcome: 'PERMISSION_DENIED',
  },
  {
    id: 9,
    name: 'Unauthorized List Scraping Across Tenants',
    operation: 'list',
    path: '/workspaces/user_1/prospects',
    auth: { uid: 'user_2', email_verified: true },
    expectedOutcome: 'PERMISSION_DENIED',
  },
  {
    id: 10,
    name: 'Immutable OwnerId Mutation on Update',
    operation: 'update',
    path: '/workspaces/user_1/prospects/p_1',
    auth: { uid: 'user_1', email_verified: true },
    payload: { ownerId: 'user_2', status: 'Contactado', updatedAt: 'SERVER_TIME' },
    expectedOutcome: 'PERMISSION_DENIED',
  },
  {
    id: 11,
    name: 'Forged Client Timestamp on Create',
    operation: 'create',
    path: '/workspaces/user_1/prospects/p_1',
    auth: { uid: 'user_1', email_verified: true },
    payload: { ownerId: 'user_1', name: 'Lead', company: 'Co', email: 'a@b.c', channel: 'Email', status: 'Nuevo', temperature: 'Caliente', createdAt: '2020-01-01T00:00:00Z', updatedAt: 'SERVER_TIME' },
    expectedOutcome: 'PERMISSION_DENIED',
  },
  {
    id: 12,
    name: 'Terminal State Bypass (Updating Descartado Prospect)',
    operation: 'update',
    path: '/workspaces/user_1/prospects/p_discarded',
    auth: { uid: 'user_1', email_verified: true },
    payload: { status: 'Cualificado', temperature: 'Caliente', updatedAt: 'SERVER_TIME' },
    expectedOutcome: 'PERMISSION_DENIED',
  },
];
