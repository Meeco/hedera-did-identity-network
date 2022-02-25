import {
    AccountId,
    Client,
    PrivateKey,
    ScheduleId,
    ScheduleCreateTransaction,
    ScheduleSignTransaction,
    TransferTransaction,
    Hbar,
    ScheduleInfoQuery
} from "@hashgraph/sdk";

require("dotenv").config();

describe("Schedule transaction", async () => {
    const OPERATOR_ID = process.env.HEDERA_OPERATOR_ID;
    const OPERATOR_ID1 = process.env.HEDERA_OPERATOR_ID1;
    const OPERATOR_KEY = process.env.HEDERA_OPERATOR_KEY;
    const OPERATOR_KEY1 = process.env.HEDERA_OPERATOR_KEY1;
    const NETWORK = process.env.HEDERA_NETWORK;
    const MIRROR_PROVIDER = ["hcs." + NETWORK + ".mirrornode.hedera.com:5600"];

    // @ts-ignore
    const senderAccount = AccountId.fromString(OPERATOR_ID);
    // @ts-ignore
    const recipientAccount = AccountId.fromString(OPERATOR_ID1);
    // @ts-ignore
    const senderKey = PrivateKey.fromString(OPERATOR_KEY);
    // @ts-ignore
    const recipientKey = PrivateKey.fromString(OPERATOR_KEY1);
    let client = Client.forTestnet();
    client.setMirrorNetwork(MIRROR_PROVIDER);
    client.setOperator(senderAccount, senderKey);
    beforeAll(async () => {

    });

    it("Create a schedule transaction", async () => {
        //Create a transaction to schedule
        const transaction = new TransferTransaction()
            .addHbarTransfer(senderAccount, Hbar.fromTinybars(0))
            .addHbarTransfer(recipientAccount, Hbar.fromTinybars(0));

        //Schedule a transaction
        const scheduleTransaction = await new ScheduleCreateTransaction()
            .setScheduledTransaction(transaction)
            .execute(client);

        //Get the receipt of the transaction
        const receipt = await scheduleTransaction.getReceipt(client);

        //Get the schedule ID
        // @ts-ignore
        const scheduleId: ScheduleId = receipt.scheduleId;
        console.log("The schedule ID is " + scheduleId);

        //Submit the first signature
        const signature1 = await (await new ScheduleSignTransaction()
            .setScheduleId(scheduleId)
            .freezeWith(client)
            .sign(senderKey))
            .execute(client);

        //Verify the transaction was successful and submit a schedule info request
        const receipt1 = await signature1.getReceipt(client);
        console.log("The transaction status is " + receipt1.status.toString());

        const query1 = await new ScheduleInfoQuery()
            .setScheduleId(scheduleId)
            .execute(client);

        //Confirm the signature was added to the schedule
        console.log(query1);

        //Submit the second signature
        const signature2 = await (await new ScheduleSignTransaction()
            .setScheduleId(scheduleId)
            .freezeWith(client)
            .sign(recipientKey))
            .execute(client);

        //Verify the transaction was successful
        const receipt2 = await signature2.getReceipt(client);
        console.log("The transaction status " + receipt2.status.toString());

        //Get the schedule info
        const query2 = await new ScheduleInfoQuery()
            .setScheduleId(scheduleId)
            .execute(client);

        console.log(query2);
    });
});
