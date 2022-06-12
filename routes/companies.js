/** Routes about companies. */

const express = require("express");
const router = new express.Router();
const db = require("../db");
const ExpressError = require("../expressError");

const slugify = require('slugify')
const slugifyConfig = {
	replacement: '',
	lower: true,
	strict: true
}

/**
 * GET /companies
 * Returns list of companies, like {companies: [{code, name}, ...]}
 */
router.get("/", async (req, res, next) => {
	try {
		const companiesQuery = await db.query(
			"SELECT code, name FROM companies"
		);

		if (companiesQuery.rows.length === 0) {
			let notFoundError = new ExpressError(
				`No companies exist in this database.`
			);
			notFoundError.status = 404;
			throw notFoundError;
		}

		return res.json({ companies: companiesQuery.rows });
	} catch (err) {
		return next(err);
	}
});

/**
 * GET /companies/[code]
 * Return obj of company: {company: {code, name, description, invoices: [id, ...]}}
 * If the company given cannot be found, this should return a 404 status response.
 */

router.get("/:code", async (req, res, next) => {
	try {
		const { code } = req.params;

		const companyQuery = await db.query(
			`SELECT code, name, description
			FROM companies
			WHERE code = $1`,
			[code]
		);
		
		const invoiceQuery = await db.query(
			`
			SELECT id, amt, paid, add_date, paid_date, comp_code
			FROM invoices
			WHERE comp_code = $1
			`, [code]
		);
			
		const industriesQuery = await db.query(
			`
			SELECT industries.name
			FROM industries
			INNER JOIN company_industry
			ON industries.code = company_industry.industry_code
			INNER JOIN companies
			ON company_industry.company_code = companies.code
			WHERE companies.code = $1
			`, [code]
		);

		if (companyQuery.rows.length == 0) {
			let notFoundError = new ExpressError(
				`Company code ${code} not found.`
			);
			notFoundError.status = 404;
			throw notFoundError;
		}

		let companyResult = companyQuery.rows[0];
		companyResult.invoices = invoiceQuery.rows.map((i) => i);
		companyResult.industries = industriesQuery.rows.map((i) => i.name);
		console.log("Company Result", companyResult.industries)

		return res.json({ company: companyResult });
	} catch (err) {
		return next(err);
	}
});

/**
 * POST /companies
 * Adds a company.
 * Needs to be given JSON like: {code, name, description}
 * Returns obj of new company: {company: {code, name, description}}
 */
router.post("/", async (req, res, next) => {
	try {
		const { name, description } = req.body;

		const result = await db.query(
			`INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING code, name, description`,
			[slugify(name, slugifyConfig), name, description]
		);

		return res.status(201).json({ company: result.rows[0] });
	} catch (err) {
		return next(err);
	}
});

/**
 * PUT /companies/[code]
 * Edit existing company.
 * Should return 404 if company cannot be found.
 * Needs to be given JSON like: {name, description}
 * Returns update company object: {company: {code, name, description}}
 */
router.put("/:code", async (req, res, next) => {
	try {
		const { name, description } = req.body;

		const result = await db.query(
			`
			UPDATE companies
			SET name=$2, description=$3
			WHERE code=$1
			RETURNING code, name, description
			`, [req.params.code, name, description]
		);

		if (result.rows.length === 0) {
			let notFoundError = new ExpressError(
				`Company code ${req.params.code} not found.`
			);
			notFoundError.status = 404;
			throw notFoundError;
		}

		res.status(201).json({ company: result.rows[0] });
	} catch (err) {
		return next(err);
	}
});

/**
 * DELETE /companies/[code]
 * Deletes company.
 * Should return 404 if company cannot be found.
 * Returns {status: "deleted"}
 */
router.delete("/:code", async (req, res, next) => {
	try {
		const result = await db.query(`DELETE FROM companies WHERE code=$1`, [
			req.params.code,
		]);

		return res.json({ message: "Deleted" });
	} catch (err) {
		return next(err);
	}
});

module.exports = router;
