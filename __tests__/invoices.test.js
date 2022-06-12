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

describe("GET /invoices", () => {
	it("should return id and comp_code info", async () => {
		const response = await request(app).get(`/invoices`);
		expect(response.statusCode).toEqual(200);
		expect(response.body.invoices).toContainEqual(
			expect.objectContaining({
				comp_code: "acmecorp",
			})
		);
		expect(response.body.invoices).toContainEqual(
			expect.objectContaining({
				comp_code: "cardonecapital",
			})
		);
	});
	it("should not return amt, paid, or paid_date info on invoices", async () => {
		const response = await request(app).get(`/invoices`);
		expect(response.body.invoices).not.toContainEqual(
			expect.objectContaining({
				amt: 200,
			})
		);
		expect(response.body.invoices).not.toContainEqual(
			expect.objectContaining({
				amt: 300,
			})
		);
		expect(response.body.invoices).not.toContainEqual(
			expect.objectContaining({
				paid: true,
			})
		);
		expect(response.body.invoices).not.toContainEqual(
			expect.objectContaining({
				paid_date: "2018-01-01",
			})
		);
	});
	it("should return 404 if no invoices exist", async () => {
		await db.query("DELETE FROM invoices;");

		try {
			let resp = await request(app).get(`/invoices`);
			expect(response.statusCode).toEqual(404);
		} catch (err) {
			expect(err).toEqual(err);
		}

	});
});

describe("GET /invoices/[id]", () => {
	it("should return an invoice by querying for id", async () => {
		const response = await request(app).get(`/invoices/1`);
		expect(response.statusCode).toEqual(200);
		expect(response.body.invoice.comp_code).toEqual("acmecorp");
	});

	it("should return 404 if invoice not found", async () => {
		const response = await request(app).get(`/invoices/23423`);
		expect(response.statusCode).toEqual(404);
	});
});

describe("POST /invoices", () => {
	it("should post a new invoice", async () => {
		let response = await request(app).post(`/invoices`).send({
			comp_code: "acmecorp",
			amt: 275,
		});
		expect(response.body.invoice.amt).toEqual(275);
		expect(response.body.invoice.comp_code).toEqual("acmecorp");
	});
});

describe("PUT /invoices", () => {
	it("should update an existing invoice", async () => {
		let response = await request(app).put(`/invoices/1`).send({
			amt: 349,
			paid: true
		});
		expect(response.body.invoice.amt).toEqual(349);
		expect(response.body.invoice.comp_code).toEqual("acmecorp");
	});
	it("should return 404 if invoice does not exist", async () => {
		let response = await request(app).put(`/invoices/1209123`).send({
			amt: 349,
		});

		expect(response.statusCode).toEqual(404);
	});
});
describe("DELETE /invoices/[id]", () => {
	it("should delete invoice", async () => {
		let response = await request(app).delete(`/invoices/1`);
		expect(response.body.message).toEqual("Deleted");
	});
});

afterAll(async function () {
	// close db connection
	await db.end();
});
