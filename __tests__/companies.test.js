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

describe("GET /companies", () => {
	it("should return all companies in db", async () => {
		const response = await request(app).get(`/companies`);
		expect(response.body).toEqual({
			companies: [
				{ code: 'acmecorp', name: 'ACME Corp.' },
				{ code: 'cardonecapital', name: 'Cardone Capital'},
				{ code: 'smackdown', name: 'Smackdown'},
				{ code: 'islandblock', name: 'Island Block'}
			],
		});
		expect(response.body.companies.length).toEqual(4);
	});

	it("should return in json format", async () => {
		const response = await request(app).get(`/companies`);
        const { code } = response.body.companies[0];
        
		expect(code).toBe('acmecorp');
	})

	it("should return 404 if no companies in db", async () => {
		await db.query(`DELETE FROM companies;`);
		const response = await request(app).get(`/companies`);
		expect(response.statusCode).toEqual(404);
	});
});

describe("GET /companies/[code]", () => {
	it("should return a company by querying for code", async () => {
		const response = await request(app).get(`/companies/acmecorp`);
		expect(response.statusCode).toEqual(200);
		expect(response.body.company.code).toEqual("acmecorp");
	});

	it("should return invoices for that company in the same object", async () => {
		const response = await request(app).get(`/companies/acmecorp`);
		expect(response.statusCode).toEqual(200);

		expect(response.body.company.invoices).toContainEqual(
			expect.objectContaining({
				id: expect.any(Number),
			})
		);
	});

	it("should return industries for that company in the same object", async () => {
		const response = await request(app).get(`/companies/acmecorp`);

		expect(response.body.company.industries).toContain('Accounting');
	});

	it("should return 404 if company not found", async () => {
		try {
			const response = await request(app).get(`/companies/notreal`);
			expect(response.statusCode).toEqual(404);
		} catch (err) {
			expect(err).toEqual(err);
		}

	});
});

describe("POST /companies", () => {
	it("should add a new company to db", async () => {
		let response = await request(app).post(`/companies`).send({
			code: "newCorp",
			name: "The New Corp.",
			description: "We're new to the database.",
		});
		expect(response.statusCode).toEqual(201);
		expect(response.body.company.name).toEqual("The New Corp.");
	});
	it("should slugify name", async () => {
		let response = await request(app).post(`/companies`).send({
			name: "The New Corp.",
			description: "We're new to the database.",
		});
		expect(response.body.company.code).toEqual("thenewcorp");
	});
	it("should throw internal error if there's no [code]", async () => {
		let response = await request(app).post(`/companies`).send({
			description: "We don't have a code.",
		});
		expect(response.statusCode).toEqual(500);
	});
	it("should throw internal error if there's no [name]", async () => {
		try {
			let response = await request(app).post(`/companies`).send({
				code: "nocode",
				description: "We don't have a code.",
			});
			expect(response.statusCode).toEqual(500);
		} catch (err) {
			expect(e).toEqual(err);
		}
	});
});

describe("PUT /companies/[code]", () => {
	it("should update existing company's information", async () => {
		let response = await request(app).put(`/companies/acmecorp`).send({
			code: "acmecorp",
			name: "acmecorp 2.0",
			description: "The NEW Acme Corp.",
		});
		expect(response.statusCode).toEqual(201);
		expect(response.body.company.name).toEqual("acmecorp 2.0");
	});

	it("should return 404 if company code does not exist", async () => {
		try {
			let response = await request(app).put(`/companies/notfound`).send({
				code: "notfound",
				name: "acmecorp 2.0",
				description: "The NEW Acme Corp.",
			});
			expect(response.statusCode).toEqual(404);
			expect(response.error.text).toContain("not found");
		} catch (err) {
			expect(e).toEqual(err);
		}
	});
});

describe("DELETE /companies/[code]", () => {
	it("should delete a company from the db", async () => {
		let response = await request(app).delete(`/companies/acmecorp`);
		expect(response.body.message).toEqual("Deleted");
	});
	it("should return 404 if company code does not exist", async () => {
		try {
			let response = await request(app).delete(`/companies/notfound`)
			expect(response.statusCode).toEqual(404);
			expect(response.error.text).toContain("not found");
		} catch (err) {
			expect(err).toEqual(err);
		}
	});
});

afterAll(async function () {
	// close db connection
	await db.end();
});
