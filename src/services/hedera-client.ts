import { Client } from "@hashgraph/sdk";

const { HEDERA_NETWORK, HEDERA_OPERATOR_ID, HEDERA_OPERATOR_KEY } = process.env;

if (!HEDERA_NETWORK) {
  throw new Error("HEDERA_NETWORK is not configured");
}

if (!HEDERA_OPERATOR_ID || !HEDERA_OPERATOR_KEY) {
  throw new Error("HEDERA OPERATOR is not configured");
}

const client = Client.forName(HEDERA_NETWORK);

client.setOperator(HEDERA_OPERATOR_ID, HEDERA_OPERATOR_KEY);

export { client };
