// connect to right DB --- set before loading db.js
process.env.NODE_ENV = "test";

// npm packages
const request = require("supertest");

// app imports
const app = require("../app");
const db = require("../db");

let testCompanyA;
let testCompanyB;

beforeEach(async function () {
	let result = await db.query(`
    INSERT INTO
      companies (code, name, description) VALUES ('acme', 'ACME Corp.', 'The ACME Company.'), ('cardone', 'Cardone Capital', 'Invest in real estate.')
      RETURNING code, name`);
	testCompanyA = result.rows[0];
	testCompanyB = result.rows[1];
});

describe("GET /companies", () => {
	it("should return all companies in db", async () => {
		const response = await request(app).get(`/companies`);
		expect(response.statusCode).toEqual(200);
		expect(response.body).toEqual({
			companies: [testCompanyA, testCompanyB],
		});
		expect(response.body.companies.length).toEqual(2);
	});

	it("should return 404 if no companies in db", async () => {
		await db.query(`
        DELETE FROM companies`);
		const response = await request(app).get(`/companies`);
		expect(response.statusCode).toEqual(404);
	});
});

describe("GET /companies/[code]", () => {
	it("should return a company by querying for code", async () => {
		const response = await request(app).get(`/companies/acme`);
		expect(response.statusCode).toEqual(200);
		expect(response.body.company.code).toEqual("acme");
		expect(response.body.company.name).toEqual("ACME Corp.");
	});

	it("should return 404 if company not found", async () => {
		const response = await request(app).get(`/companies/notreal`);
		expect(response.statusCode).toEqual(404);
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
	it("should throw internal error if there's no [code]", async () => {
		let response = await request(app).post(`/companies`).send({
			name: "no code.",
			description: "We don't have a code.",
		});
		expect(response.statusCode).toEqual(500);
	});
	it("should throw internal error if there's no [name]", async () => {
		let response = await request(app).post(`/companies`).send({
			code: "nocode",
			description: "We don't have a code.",
		});
		expect(response.statusCode).toEqual(500);
	});
});

describe("PUT /companies/[code]", () => {
	it("should update existing company's information", async () => {
		let response = await request(app).put(`/companies/acme`).send({
			code: "acme",
			name: "acme 2.0",
			description: "The NEW Acme Corp.",
		});
		expect(response.statusCode).toEqual(201);
		expect(response.body.company.name).toEqual("acme 2.0");
	});

	it("should return 404 if company code does not exist", async () => {
		let response = await request(app).put(`/companies/notfound`).send({
			code: "notfound",
			name: "acme 2.0",
			description: "The NEW Acme Corp.",
		});
		expect(response.statusCode).toEqual(404);
		expect(response.error.text).toContain("not found");
	});
});

describe("DELETE /companies[code]", () => {
	it("should delete a company from the db", async () => {
		let response = await request(app).delete(`/companies/acme`);
		expect(response.body.message).toEqual("Deleted");
	});
});

afterEach(async function () {
	// delete any data created by test
	await db.query("DELETE FROM companies");
});

afterAll(async function () {
	// close db connection
	await db.end();
});
