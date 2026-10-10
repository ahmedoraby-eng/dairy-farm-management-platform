import { TenantIsolationError, ValidationError } from "./errors.js";

/**
 * Identifies the tenant (customer organisation) an operation runs for.
 *
 * Every tenant-scoped aggregate carries a tenantId and must be checked
 * against the active context before it is read or combined with other data.
 */
export class TenantContext {
  readonly tenantId: string;

  constructor(tenantId: string) {
    if (!tenantId.trim()) {
      throw new ValidationError("tenantId is required");
    }
    this.tenantId = tenantId;
    Object.freeze(this);
  }

  ensureOwns(tenantId: string, what = "resource"): void {
    if (tenantId !== this.tenantId) {
      throw new TenantIsolationError(`${what} belongs to tenant '${tenantId}', not '${this.tenantId}'`);
    }
  }
}
