export class Service {
  /**
   * Service ID consists of two parts: <br />
   * 1) DID document ID service belongs to <br />
   * 2) Unique service identifier in a format "#service-{number}"
   * @example "did:hedera:testnet:z6Mkfza16PqnyMyxPZd7dVhs6ySUettURTztjNJ8qBKwyHg5_0.0.30835719#service-1"
   */
  id!: string;
  type!: "LinkedDomains" | "DIDCommMessaging";
  /**
   * @example "https://your.service/did-comm"
   */
  serviceEndpoint!: string;
}
