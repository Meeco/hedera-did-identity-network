# hedera-appnet

This project is an example of how appnets can build identity networks on top of Hedera and utilize Hedera DID Method.

## Run locally

Install dependencies.

   ```sh
   npm install && npm start:dev
   ```

## Run locally using docker-compose

Install dependencies.

Fill in `.env` configuration variables.

   ```sh
   docker-compose up
   ```

## Swagger docs
<http://localhost:8000/docs>

## Run Production

1. Install dependencies.

   ```sh
   npm install
   ```

2. Build the production server.

   ```sh
   npm build
   ```

3. Run the server.

   ```sh
   npm start
   ```

## Run tests

```sh
npm test
```

Integration tests require `jest.setup.ts` configuration to be filled in with valid operator details. Tests will run requests against `testnet` consensus services.

## Authorization

This project uses signed HTTP requests to authorize users. Only user who owns private key listed in `authentication` section of the targeted DID document is allowed to perform modifications. 
There are three endpoints that in this example project have no authorization added:

- `POST /did`
- `POST /did/{did}/register`
- `GET /did/{did}`

It is up to developers to decide how these endpoints should be secured based on their use case.
Example of how requests can be made against API please refer to `scripts/make-appnet-api-request.js` script. More details can also be found on `authentication.ts` file and `tests`.