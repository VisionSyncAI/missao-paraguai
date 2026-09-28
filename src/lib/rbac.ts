const COMMERCIAL_PERMS = [
  "lead:read",
  "lead:update",
  "lead:assign",
  "meeting:read",
  "meeting:create",
  "meeting:update",
  "proposal:read",
  "proposal:write",
  "presentation:manage",
  "payment:read",
  "registration:read",
  "registration:write",
  "order:read",
  "order:write",
];

export function can(role: string, permission: string) {
  const map: Record<string, string[]> = {
    SUPER_ADMIN: ["*"],
    ADMIN: ["*"],
    COMMERCIAL: COMMERCIAL_PERMS,
    CONSULTANT: ["lead:read", "lead:update", "meeting:read", "meeting:update", "proposal:read", "proposal:write"],
    FINANCE: [
      "lead:read",
      "order:read",
      "payment:read",
      "payment:write",
      "refund:write",
      "catalog:write",
      "registration:read",
    ],
    OPERATIONS: [
      "lead:read",
      "meeting:read",
      "registration:read",
      "participant:read",
      "participant:write",
      "document:read",
      "document:write",
      "cohort:read",
      "cohort:write",
      "event:read",
      "event:write",
    ],
    OPS: [
      "lead:read",
      "meeting:read",
      "registration:read",
      "participant:read",
      "participant:write",
      "document:read",
      "document:write",
      "cohort:read",
      "cohort:write",
      "event:read",
      "event:write",
    ],
  };
  const perms = map[role] ?? [];
  return perms.includes("*") || perms.includes(permission);
}
