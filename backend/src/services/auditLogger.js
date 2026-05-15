import AuditLog from '../models/AuditLog.js';

export const AUDIT_ACTIONS = {
  USER_SIGNUP: 'USER_SIGNUP',
  USER_LOGIN: 'USER_LOGIN',
  PROJECT_CREATED: 'PROJECT_CREATED',
  INVITE_GENERATED: 'INVITE_GENERATED',
  MEMBER_JOINED: 'MEMBER_JOINED',
  TASK_CREATED: 'TASK_CREATED',
  TASK_UPDATED: 'TASK_UPDATED',
  DEPENDENCY_REJECTED: 'DEPENDENCY_REJECTED',
  TASK_FAILED: 'TASK_FAILED',
  RETRY_ATTEMPTED: 'RETRY_ATTEMPTED',
};

export const writeAuditLog = async ({
  actor = null,
  action,
  entity,
  metadata = {},
}) =>
  AuditLog.create({
    actor,
    action,
    entity,
    metadata,
  });
