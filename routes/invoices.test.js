// connect to right DB --- set before loading db.js
process.env.NODE_ENV = "test";

// npm packages
const request = require("supertest");

// app imports
const app = require("../app");
const db = require("../db");

let testInvoiceA;
let testInvoiceB;
let testInvoiceC;
let testInvoiceD;

beforeEach(async () => {
	let companyResult = await db.query(`
    INSERT INTO
      companies (code, name, description) VALUES ('acme', 'ACME Corp.', 'The ACME Company.'), ('cardone', 'Cardone Capital', 'Invest in real estate.')
      RETURNING code, name`);
	testCompanyA = companyResult.rows[0];
	testCompanyB = companyResult.rows[1];

	let invoicesResult = await db.query(
		`INSERT INTO invoices (comp_code, amt, paid, paid_date) VALUES ('acme', 100, false, null),
        ('acme', 200, false, null),
        ('cardone', 300, true, '2018-01-01'),
        ('cardone', 400, false, null) RETURNING id, comp_code, amt, paid, paid_date`
	);
	testInvoiceA = invoicesResult.rows[0];
	testInvoiceB = invoicesResult.rows[1];
	testInvoiceC = invoicesResult.rows[2];
	testInvoiceD = invoicesResult.rows[3];
});

describe("GET /invoices", () => {
	it("should return id and comp_code info", async () => {
		const response = await request(app).get(`/invoices`);
		expect(response.statusCode).toEqual(200);
		expect(response.body.invoices).toContainEqual(
			expect.objectContaining({
				comp_code: "acme",
			})
		);
		expect(response.body.invoices).toContainEqual(
			expect.objectContaining({
				comp_code: "cardone",
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
		await db.query("DELETE FROM invoices");

		const response = await request(app).get(`/invoices`);

		expect(response.statusCode).toEqual(404);
	});
});

describe("GET /invoices/[id]", () => {
	it("should return an invoice by querying for id", async () => {
		const response = await request(app).get(`/invoices/${testInvoiceA.id}`);
		expect(response.statusCode).toEqual(200);
		expect(response.body.invoice.comp_code).toEqual("acme");
	});

	it("should return 404 if company not found", async () => {
		const response = await request(app).get(`/companies/1`);
		expect(response.statusCode).toEqual(404);
	});
});

describe("POST /invoices", () => {
	it("should post a new invoice", async () => {
		let response = await request(app).post(`/invoices`).send({
			comp_code: "acme",
			amt: 275,
		});
		expect(response.body.invoice.amt).toEqual(275);
		expect(response.body.invoice.comp_code).toEqual("acme");
	});
});

describe("PUT /invoices", () => {
	it("should update an existing invoice", async () => {
		let response = await request(app)
			.put(`/invoices/${testInvoiceA.id}`)
			.send({
				amt: 349,
			});
		expect(response.body.invoice.amt).toEqual(349);
		expect(response.body.invoice.comp_code).toEqual("acme");
	});
	it("should return 404 if invoice does not exist", async () => {
		let response = await request(app).put(`/invoices/1`).send({
			amt: 349,
		});
		console.log(response.body);

		expect(response.statusCode).toEqual(404);
	});
});
describe("DELETE /invoices/[id]", () => {
	it("should delete invoice", async () => {
		let response = await request(app).delete(
			`/invoices/${testInvoiceA.id}`
		);
		expect(response.body.message).toEqual("Deleted");
	});
});

afterEach(async () => {
	// delete any data created by test
	await db.query("DELETE FROM companies");
	await db.query("DELETE FROM invoices");
});

afterAll(async function () {
	// close db connection
	await db.end();
});
