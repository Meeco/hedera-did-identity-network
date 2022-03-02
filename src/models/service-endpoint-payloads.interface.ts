import { Service } from "./service.interface";

export interface IServiceRegisterPayload {
  service: Service;
}

export interface IServiceUpdateBody {
  type: "LinkedDomains" | "DIDCommMessaging";
  /**
   * @example "https://your.service/did-comm"
   */
  serviceEndpoint: string;
}

export interface IServiceUpdatePayload {
  service: IServiceUpdateBody;
}
