process.env.NODE_ENV = "test";

const db = require("./db");

async function setUp() {
	await db.query(`
		DELETE FROM invoices;
		DELETE FROM companies;
		DELETE FROM industries;
		DELETE FROM company_industry;
		SELECT setval('invoices_id_seq', 1, false);
		SELECT setval('company_industry_id_seq', 1, false);

		INSERT INTO companies (code, name, description)
		VALUES
			('acmecorp', 'ACME Corp.', 'The ACME Company.'),
			('cardonecapital', 'Cardone Capital', 'Invest in real estate.'),
			('smackdown', 'Smackdown', 'Friday Night Smackdown.'),
			('islandblock', 'Island Block', 'AAPI Culture.');

		INSERT INTO invoices (comp_code, amt, paid, paid_date)
		VALUES
			('acmecorp', 100, false, null),
			('acmecorp', 200, false, null),
			('cardonecapital', 300, true, '2018-01-01'),
			('cardonecapital', 400, false, null)
		RETURNING id, comp_code, amt, paid, paid_date;

		INSERT INTO industries 
		VALUES ('acct', 'Accounting'),
			('mktng', 'Marketing'),
			('sales', 'Sales'),
			('tech', 'Tech');

		INSERT INTO company_industry (company_code, industry_code)
		VALUES ('acmecorp', 'acct'),
			('acmecorp', 'mktng'),
			('cardonecapital', 'mktng'),
			('smackdown', 'acct'),
			('smackdown', 'sales'),
			('islandblock', 'tech');
	`);

}

module.exports = { setUp };