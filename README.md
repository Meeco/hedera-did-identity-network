# Hedera™ Hashgraph Appnet - hedera-appnet

This project is an example of how appnets can build identity networks on top of Hedera and utilize Hedera DID Method.

## About
The appnet runs on localhost port 8000 be default. It does not expose any user interface, instead there is a Swagger (OpenAPI) Definitions Collection available [here](/public/swagger.json) that demonstrate a full end-to-end flow of DID documents generation, publishing, update and deletion.

## Table of Contents

- [Hedera™ Hashgraph Appnet - hedera-appnet](#hedera%e2%84%a2-hashgraph-appnet---hedera-appnet)
   - [Table of Contents](#table-of-contents)
   - [Configuration](#configuration)
   - [Usage](#usage)
      - [Run locally](#run-locally)
      - [Run locally using docker-compose](#run-locally-using-docker-compose)
      - [Run Production](#run-production)
      - [Run tests](#run-tests)
      - [Swagger docs](#swagger-docs)
      - [Authorization](#authorization)
   - [Contributing](#contributing)
   - [License Information](#license-information)
   - [References](#references)
   - 
## Configuration

The following environment variables are required to be set up before running the application:

- `OPERATOR_ID` - Your testnet account ID.
- `OPERATOR_KEY` - Your testnet account ID private key
- `HEDERA_NETWORK` - The Hedera network this application should connect to (testnet, previewnet, mainnet)
- `NODE_LOCAL_PORT` - Node local port, its 8000 by default.
- `NODE_DOCKER_PORT` - Node docker port, its 8000 by default.
- `MONGODB_DATABASE` - MongoDB database name, its appnet_dev by default.
- `MONGODB_LOCAL_PORT` - MongoDB local port, its 7017 by default.
- `MONGODB_DOCKER_PORT` - MongoDB docker port, its 27017 by default.
- `MONGODB_USER` - MongoDB username, its root by default.
- `MONGODB_PASSWORD` - MongoDB user password, its 123456 by default.

## Usage

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


## Swagger docs
<http://localhost:8000/docs>

## Authorization

This project uses [signed HTTP requests](https://datatracker.ietf.org/doc/html/draft-ietf-httpbis-message-signatures) to authorize users. Only user who owns private key listed in `authentication` section of the targeted DID document is allowed to perform modifications. 
There are three endpoints that in this example project have no authorization added:

- `POST /did`
- `POST /did/{did}/register`
- `GET /did/{did}`

It is up to developers to decide how these endpoints should be secured based on their use case.
For an example of how requests can be made against API please refer to `scripts/make-appnet-api-request.js` script. More details can also be found on `authentication.ts` file and `tests`.

## Contributing

We welcome participation from all developers!

## References

- <https://github.com/hashgraph/did-method>
- <https://github.com/hashgraph/hedera-sdk-java>
- <https://docs.hedera.com/hedera-api/>
- <https://www.hedera.com/>
- <https://www.w3.org/TR/did-core/>

[did-method-spec]: https://github.com/hashgraph/did-method
[openapi]: https://swagger.io/specification