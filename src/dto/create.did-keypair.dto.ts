import { PrivateKey } from "@hashgraph/sdk";

export interface CreateDidKeypairDto {
  did: string;
  privateKey: PrivateKey;
}
