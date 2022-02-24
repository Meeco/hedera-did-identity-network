import {
    AccountId,
    Client,
    PrivateKey,
    ScheduleId,
    ScheduleCreateTransaction,
    ScheduleSignTransaction,
    ScheduleDeleteTransaction,
    TransferTransaction,
    Hbar

} from "@hashgraph/sdk";
require("dotenv").config();

describe("Schedule transaction", async () => {
    const OPERATOR_ID = process.env.HEDERA_OPERATOR_ID;
    const OPERATOR_KEY = process.env.HEDERA_OPERATOR_KEY;
    const NETWORK = process.env.HEDERA_NETWORK;
    const MIRROR_PROVIDER = ["hcs." + NETWORK + ".mirrornode.hedera.com:5600"];

    const privateKeySigner1 = PrivateKey.generate();
    const adminKey = PrivateKey.generate();
    // @ts-ignore
    const operatorId = AccountId.fromString(OPERATOR_ID);
    // @ts-ignore
    const operatorKey = PrivateKey.fromString(OPERATOR_KEY);
    let client = Client.forTestnet();
    client.setMirrorNetwork(MIRROR_PROVIDER);
    client.setOperator(operatorId, operatorKey);
    beforeAll(async () => {

    });

    it("Create scheduleID", async () => {
        const scheduleID = new ScheduleId(0, 0, 10);
        console.log(scheduleID)
    });
    it("Create a schedule transaction", async () => {
         let transactionToSchedule = new TransferTransaction()
            .addHbarTransfer(operatorId, Hbar.fromTinybars(-1))
            .addHbarTransfer(operatorId, Hbar.fromTinybars(1));

        //Create a schedule transaction
        const transaction = new ScheduleCreateTransaction()
            .setScheduledTransaction(transactionToSchedule);
            // .setAdminKey(operatorKey)
            // .setPayerAccountId(operatorId);

        //Sign with the client operator key and submit the transaction to a Hedera network
        // @ts-ignore
        const txResponse = await transaction.execute(client);

        // //Request the receipt of the transaction
        // // @ts-ignore
        // const receipt = await txResponse.getReceipt(client);
        //
        // //Get the schedule ID
        // const scheduleId = receipt.scheduleId;
        // console.log("The schedule ID of the schedule transaction is " + scheduleId);
    });
    it("Sign a scheduled transaction", async () => {
        const scheduleID = new ScheduleId(0, 0, 10);
        // Create the transaction
        const transaction = await new ScheduleSignTransaction()
            .setScheduleId(scheduleID)
            .freezeWith(client)
            .sign(operatorKey);
            // .sign(privateKeySigner1);

        //Sign with the client operator key to pay for the transaction and submit to a Hedera network
        // @ts-ignore
        const txResponse = await transaction.execute(client);

        // //Get the receipt of the transaction
        // // @ts-ignore
        // const receipt = await txResponse.getReceipt(client);
        //
        // //Get the transaction status
        // const transactionStatus = receipt.status;
        // console.log("The transaction consensus status is " + transactionStatus);
    });
    // it("Delete a scheduled transaction", async () => {
    //     const scheduleID = new ScheduleId(0, 0, 10);
    //     //Create the transaction and sign with the admin key
    //     const transaction = await new ScheduleDeleteTransaction()
    //         .setScheduleId(scheduleID)
    //         .freezeWith(client)
    //         .sign(adminKey);
    //
    //     //Sign with the operator key and submit to a Hedera network
    //     const txResponse = await transaction.execute(client);
    //
    //     //Get the transaction receipt
    //     const receipt = await txResponse.getReceipt(client);
    //
    //     //Get the transaction status
    //     const transactionStatus = receipt.status;
    //     console.log("The transaction consensus status is " + transactionStatus);
    // });
});
