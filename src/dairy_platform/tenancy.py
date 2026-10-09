from dataclasses import dataclass


class TenantIsolationError(Exception):
    """Raised when data belonging to one tenant is used in another tenant's context."""


@dataclass(frozen=True)
class TenantContext:
    """Identifies the tenant (customer organisation) an operation runs for.

    Every tenant-scoped aggregate carries a tenant_id and must be checked
    against the active context before it is read or combined with other data.
    """

    tenant_id: str

    def __post_init__(self) -> None:
        if not self.tenant_id or not self.tenant_id.strip():
            raise ValueError("tenant_id is required")

    def ensure_owns(self, tenant_id: str, what: str = "resource") -> None:
        if tenant_id != self.tenant_id:
            raise TenantIsolationError(f"{what} belongs to tenant '{tenant_id}', not '{self.tenant_id}'")
