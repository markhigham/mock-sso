const logger = require("./lib/logger")(__filename);
const config = require("./config");

const App = require("./lib/app");
app = new App(config);

app
  .start(config)
  .then(() => {
    console.log("started");
  })
  .catch((err) => {
    logger.error(err);
    process.exit(-1);
  });
