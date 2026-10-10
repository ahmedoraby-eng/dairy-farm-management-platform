/** Raised when an input breaks a domain rule (the equivalent of a validation failure). */
export class ValidationError extends Error {
  override readonly name = "ValidationError";
}

/** Raised when data belonging to one tenant is used in another tenant's context. */
export class TenantIsolationError extends Error {
  override readonly name = "TenantIsolationError";
}
