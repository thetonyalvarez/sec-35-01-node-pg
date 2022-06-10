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
			('acme', 'ACME Corp.', 'The ACME Company.'),
			('cardone', 'Cardone Capital', 'Invest in real estate.');
	`);

	await db.query(`
		INSERT INTO invoices (comp_code, amt, paid, paid_date)
		VALUES
			('acme', 100, false, null),
        	('acme', 200, false, null),
        	('cardone', 300, true, '2018-01-01'),
        	('cardone', 400, false, null)
		RETURNING id, comp_code, amt, paid, paid_date;
	`);

}

module.exports = { setUp };
