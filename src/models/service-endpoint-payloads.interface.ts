import { Service } from "./service.interface";

export interface IServiceRegisterPayload {
  service: Service;
}

export interface IServiceUpdateBody {
  type: "LinkedDomains" | "DIDCommMessaging";
  serviceEndpoint: string;
}

export interface IServiceUpdatePayload {
  service: IServiceUpdateBody;
}
