import { Timestamp } from "@hashgraph/sdk";

export interface CreateMessageDto {
  timestamp: Timestamp;
  operation: string;
  did: string;
  event: string;
  signature: string;
}
