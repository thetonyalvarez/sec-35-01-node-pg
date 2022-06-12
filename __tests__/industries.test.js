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

describe("GET /industries/[industry_code]", () => {
	const industry_code = 'acct'

	it("should return an industry by querying for code", async () => {
		const response = await request(app).get(`/industries/${industry_code}`);
		console.log('single industry', response.body)

		expect(response.statusCode).toEqual(200);
		expect(response.body.industry.code).toEqual("acct");
		expect(response.body.industry.name).toEqual("Accounting");
	});

	it("should return 404 if industry not found", async () => {
		try {
			const response = await request(app).get(`/industries/thisdoesntexist`);
			expect(response.statusCode).toEqual(404);
		} catch (err) {
			expect(err).toEqual(err);
		}

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

describe("POST /industries/[industry_code]/[company_code]", () => {
	const industryCode = 'acct'
	const companyCode = 'islandblock'


	it("should add a new company to an industry", async () => {
		let response = await request(app).post(`/industries/${industryCode}/${companyCode}`);

		expect(response.statusCode).toEqual(201);
		expect(response.body.result.industry_code).toEqual(industryCode);
		expect(response.body.result.company_code).toEqual("islandblock");
	});

	it("should return error if company doesn't exist in companies table", async () => {
		let response = await request(app).post(`/industries/${industryCode}/wedontexist`);

		expect(response.statusCode).toEqual(404);
	});

	it("should return error if industry doesn't exist in industries table", async () => {
		let response = await request(app).post(`/industries/thisdoesntxist/${companyCode}`);

		expect(response.statusCode).toEqual(404);
	});

});

describe("DELETE /[industry_code]/[company_code]", () => {
	const industryCode = 'acct'
	const companyCode = 'acmecorp'

	it("should delete a company/industry record from the db", async () => {

		let response = await request(app).delete(`/industries/${industryCode}/${companyCode}`)

		expect(response.body.message).toEqual("Deleted");
	});
	
	it("should return 404 if record does not exist", async () => {
		try {
			let response = await request(app).delete(`/industries/${industryCode}/islandblock`)
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
