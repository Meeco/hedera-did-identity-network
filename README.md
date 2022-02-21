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

## swagger docs
<http://localhost:8000/docs/#/>

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
