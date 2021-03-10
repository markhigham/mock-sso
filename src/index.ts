// const logger = require("./lib/logger")(__filename);
// const config = require("./config");

import { App } from "./lib/app";

const app = new App({ port: 5000, host: "0.0.0.0" });
app.start().then(() => {
  console.log("yo");
});
// app
//   .start(config)
//   .then(() => {
//     console.log("started");
//   })
//   .catch((err) => {
//     logger.error(err);
//     process.exit(-1);
//   });
