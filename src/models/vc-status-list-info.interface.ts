export class VcStatusListInfo {
  /**
   * @example "https://appnet.meecoo.me/vc/status/0.0.123/614"
   */
  id!: string;
  type!: "RevocationList2021Status" | "SuspensionList2021Status";
  /**
   * @example 614
   */
  statusListIndex!: number;
  /**
   * @example "https://appnet.meecoo.me/vc/status/0.0.123"
   */
  statusListCredential!: string;
}
