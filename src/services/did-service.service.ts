import HttpException from "../common/http-exception";
import { DidDocument } from "../models";
import { Service } from "../models/service.interface";

export interface IServiceRegisterPayload {
  service: Service;
}

export interface IServiceUpdateBody {
  type: string;
  serviceEndpoint: string;
}

export interface IServiceUpdatePayload {
  service: IServiceUpdateBody;
}

export const register = async (
  did: string,
  body: IServiceRegisterPayload
): Promise<DidDocument> => {
  return Promise.reject(
    new HttpException(
      500,
      "create service not implemented",
      "create service not implemented"
    )
  );
};

export const update = async (
  did: string,
  id: string,
  body: IServiceUpdatePayload
): Promise<DidDocument> => {
  return Promise.reject(
    new HttpException(
      500,
      "get service not implemented",
      "get service not implemented"
    )
  );
};

export const remove = async (did: string, id: string) => {
  return Promise.reject(
    new HttpException(
      500,
      "remove service not implemented",
      "remove service not implemented"
    )
  );
};
