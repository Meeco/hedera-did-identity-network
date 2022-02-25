import {
    AccountId,
    Client,
    PrivateKey,
    ScheduleId,
    ScheduleCreateTransaction,
    ScheduleSignTransaction,
    TransferTransaction,
    Hbar,
    ScheduleInfoQuery,
    ScheduleDeleteTransaction,
    PublicKey
} from "@hashgraph/sdk";

require("dotenv").config();

describe("Schedule transaction", async () => {
    const OPERATOR_ID = process.env.HEDERA_OPERATOR_ID;
    const OPERATOR_ID1 = process.env.HEDERA_OPERATOR_ID1;
    const OPERATOR_KEY = process.env.HEDERA_OPERATOR_KEY;
    const OPERATOR_KEY_P = process.env.HEDERA_OPERATOR_KEY_P;
    const OPERATOR_KEY1 = process.env.HEDERA_OPERATOR_KEY1;
    const OPERATOR_KEY1_P = process.env.HEDERA_OPERATOR_KEY1_P;
    const NETWORK = process.env.HEDERA_NETWORK;
    const MIRROR_PROVIDER = ["hcs." + NETWORK + ".mirrornode.hedera.com:5600"];

    // @ts-ignore
    const senderAccount = AccountId.fromString(OPERATOR_ID);
    // @ts-ignore
    const recipientAccount = AccountId.fromString(OPERATOR_ID1);
    // @ts-ignore
    const senderKey = PrivateKey.fromString(OPERATOR_KEY);
    // @ts-ignore
    const senderKeyP = PublicKey.fromString(OPERATOR_KEY_P);
    // @ts-ignore
    const recipientKey = PrivateKey.fromString(OPERATOR_KEY1);
    // @ts-ignore
    const recipientKeyP = PublicKey.fromString(OPERATOR_KEY1_P);
    let client = Client.forTestnet();
    client.setMirrorNetwork(MIRROR_PROVIDER);
    client.setOperator(senderAccount, senderKey);
    beforeAll(async () => {

    });

    it("Create a schedule transaction", async () => {
        //Create a transaction to schedule
        const transaction = new TransferTransaction()
            .addHbarTransfer(senderAccount, Hbar.fromTinybars(6))
            .addHbarTransfer(recipientAccount, Hbar.fromTinybars(-6));

        //Schedule a transaction
        const scheduleTransaction = await new ScheduleCreateTransaction()
            .setScheduledTransaction(transaction)
            .execute(client);

        //Get the receipt of the transaction
        const receipt = await scheduleTransaction.getReceipt(client);

        //Get the schedule ID
        const scheduleId = receipt.scheduleId ? receipt.scheduleId : " ";
        console.log("The schedule ID is " +scheduleId);

        //Get the scheduled transaction ID
        const scheduledTxId = receipt.scheduledTransactionId;
        console.log("The scheduled transaction ID is " +scheduledTxId);

        const query1 = await new ScheduleInfoQuery()
            .setScheduleId(scheduleId)
            .execute(client);

        //Confirm the signature was added to the schedule
        console.log(query1);
        setTimeout(() => {  console.log("Slept"); }, 5000);

        //Submit the second signature
        const signature2 = await (await new ScheduleSignTransaction()
            .setScheduleId(scheduleId)
            .freezeWith(client)
            .sign(recipientKey))
            .execute(client);

        //Verify the transaction was successful
        const receipt2 = await signature2.getReceipt(client);
        console.log("The transaction status " +receipt2.status.toString());

    });
});
