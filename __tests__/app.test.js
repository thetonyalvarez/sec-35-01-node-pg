/* It's setting up the environment for the test. */
// connect to right DB --- set before loading db.js
process.env.NODE_ENV = "test";

// npm packages
const request = require("supertest");

// app imports
const app = require("../app");
const db = require("../db");
const { setUp } = require("../_test_setup");
const { tearDown } = require("../_test_teardown");

beforeEach(setUp);

afterEach(tearDown);

describe("404 middleware", () => {
	it("should return 404 Express Error on invalid URL", async () => {
		const response = await request(app).get(`/invalid-url`);

		expect(response.statusCode).toEqual(404);
    });
});

afterAll(async function () {
	// close db connection
	await db.end();
});
