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

describe("GET /industries", () => {
	it("should return all industries in db", async () => {
		const response = await request(app).get(`/industries`);
		console.log(response.body)
		expect(response.body.industries[0]).toEqual({
				code: 'acct',
				name: 'Accounting',
				companies: ['acmecorp', 'smackdown'],
		});
		expect(response.body.industries.length).toEqual(4);
	});

	it("should return in json format", async () => {
		const response = await request(app).get(`/industries`);
        const { code } = response.body.industries[0];
        
		expect(code).toBe('acct');
	})

	it("should return 404 if no industries in db", async () => {
		await db.query(`DELETE FROM industries;`);
		const response = await request(app).get(`/industries`);
		expect(response.statusCode).toEqual(404);
	});

});


describe("POST /industries", () => {
	it("should add a new industry to db", async () => {
		let response = await request(app).post(`/industries`).send({
			name: "Sports Entertainment"
		});
		expect(response.statusCode).toEqual(201);
		expect(response.body.industry.name).toEqual("Sports Entertainment");
	});
	it("should slugify name", async () => {
		let response = await request(app).post(`/industries`).send({
			name: "Sports Entertainment",
		});
		expect(response.body.industry.code).toEqual("sportsentertainment");
	});
	it("should throw internal error if there's no [name]", async () => {
		try {
			let response = await request(app).post(`/industries`).send({
				code: "nocode",
			});
			expect(response.statusCode).toEqual(500);
		} catch (err) {
			expect(e).toEqual(err);
		}
	});
});

afterAll(async function () {
	// close db connection
	await db.end();
});
