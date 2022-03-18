const { changeStatus } = require("./change_status_request");

async function main() {
  await changeStatus("suspended");
}

main();
