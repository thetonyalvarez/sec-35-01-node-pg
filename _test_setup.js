process.env.NODE_ENV = "test";

const db = require("./db");

async function setUp() {
	await db.query(`DELETE FROM invoices;`);
	await db.query(`DELETE FROM companies;`);

	// await db.query(`SELECT setval('invoices_id_seq', ( SELECT MAX(code) FROM companies ));`);
	await db.query(`SELECT setval('invoices_id_seq', 1, false);`);

	await db.query(`
    	INSERT INTO companies (code, name, description)
		VALUES
			('acmecorp', 'ACME Corp.', 'The ACME Company.'),
			('cardonecapital', 'Cardone Capital', 'Invest in real estate.');
	`);

	await db.query(`
		INSERT INTO invoices (comp_code, amt, paid, paid_date)
		VALUES
			('acmecorp', 100, false, null),
        	('acmecorp', 200, false, null),
        	('cardonecapital', 300, true, '2018-01-01'),
        	('cardonecapital', 400, false, null)
		RETURNING id, comp_code, amt, paid, paid_date;
	`);

}

module.exports = { setUp };