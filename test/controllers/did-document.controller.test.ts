import DidDocumentController from "../../src/controllers/did-document.controller";

xtest("should return not implemented message", async () => {
  const controller = new DidDocumentController();
  const action = async () => {
    await controller.resolve(
      "did:hedera:testnet:z6MkvD6JAfMyP6pgQoYxfE9rubgwLD9Hmz8rQh1FAxvbW8XB_0.0.29656526"
    );
  };
  await expect(action()).rejects.toThrow("Resolve DID not impemented");
});
