const { readdirSync } = require("fs");

module.exports = (client) => {
  const events = readdirSync(`./events/`).filter((file) =>
    file.endsWith(".js")
  );
  for (let file of events) {
    try {
      let pull = require(`../events/${file}`);
      if (pull.event && typeof pull.event !== "string") {
        console.log(`ERROR ${file} EVENT`)

        continue;
      }
      pull.event = pull.event || file.replace(".js", "");
      if (typeof pull.run !== "function") {
        console.log(`ERROR ${file} EVENT`)

        continue;
      }
      client.on(pull.event, pull.run.bind(null, client));

    } catch (err) {
      console.log(err);
      console.log(`ERROR ${file} EVENT`)

    }
  }
};
