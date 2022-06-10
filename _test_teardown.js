process.env.NODE_ENV = "test";

const db = require("./db");

async function tearDown() {}

module.exports = { tearDown };
