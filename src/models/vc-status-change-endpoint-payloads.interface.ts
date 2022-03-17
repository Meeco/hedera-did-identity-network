type status = "revoked" | "suspended" | "resumed" | "active";
export interface VcStatusChangePayload {
  /**
   * @example 'revoked' | 'suspended' | 'resumed' | 'active'
   */
  status: status;
}
