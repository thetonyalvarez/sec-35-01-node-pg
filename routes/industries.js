/** Routes about industries. */

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
 * GET /industries
 * Returns list of industries and company codes associated with that industry, like {industries: [{code, name, companies: [code]}, ...]}
 */
router.get("/", async (req, res, next) => {
	try {
		const industriesQuery = await db.query(
			`
            SELECT code, name
            FROM industries
            `
		);

		if (industriesQuery.rows.length === 0) {
			let notFoundError = new ExpressError(
				`No industries exist in this database.`
			);
			notFoundError.status = 404;
			throw notFoundError;
		}

        for (let i of industriesQuery.rows) {
            let resp = await db.query(
                `
                SELECT companies.code
                FROM industries
                INNER JOIN company_industry
                ON industries.code = company_industry.industry_code
                INNER JOIN companies
                ON company_industry.company_code = companies.code
                WHERE industries.code = $1
                `, [i.code]
            );
            i.companies = resp.rows.map((j) => j.code);
        }

		return res.json({ industries: industriesQuery.rows });
	} catch (err) {
		return next(err);
	}
});

/**
 * GET /industries/[industry_code]
 * Returns single industry record with code and name, like {industry: { code: 'acct', name: 'Accounting' }...}
 */
router.get("/:industry_code", async (req, res, next) => {
	try {
		const { industry_code } = req.params;

		const industryQuery = await db.query(
			`
			SELECT code, name
			FROM industries
			WHERE code = $1
			`, [industry_code]
		);

		if (industryQuery.rows.length == 0) {
			let notFoundError = new ExpressError(
				`Industry code ${industry_code} not found.`
			);
			notFoundError.status = 404;
			throw notFoundError;
		}

		return res.json({ industry: industryQuery.rows[0] });
	} catch (err) {
		return next(err);
	}
});




/**
 * POST /industries
 * Adds an industry.
 * Needs to be given JSON like: {code, name}
 * Returns obj of new company: {industry: {code, name}}
 */

router.post("/", async (req, res, next) => {
	try {
		const { name } = req.body;

		const result = await db.query(
			`INSERT INTO industries (code, name) VALUES ($1, $2) RETURNING code, name`,
			[slugify(name, slugifyConfig), name]
		);

		return res.status(201).json({ industry: result.rows[0] });
	} catch (err) {
		return next(err);
	}
});

/**
 * POST /industries/[industry_code]/[company_code]
 * Returns obj of new company/industry assoc.: {result: [{company_code: [code], industry_code: [code]}]}
 */

router.post("/:industry_code/:company_code", async (req, res, next) => {
	try {
        const { company_code, industry_code } = req.params;

		const companyQuery = await db.query(
			`SELECT code, name, description
			FROM companies
			WHERE code = $1`,
			[company_code]
		);

		const industryQuery = await db.query(
			`
			SELECT name
			FROM industries
			WHERE code = $1
			`, [industry_code]
		);

		if (companyQuery.rows.length == 0) {
			let notFoundError = new ExpressError(
				`Company code ${company_code} not found.`
			);
			notFoundError.status = 404;
			throw notFoundError;
		}

		if (industryQuery.rows.length == 0) {
			let notFoundError = new ExpressError(
				`Industry code ${industry_code} not found.`
			);
			notFoundError.status = 404;
			throw notFoundError;
		}

		const result = await db.query(
			`
			INSERT INTO company_industry (company_code, industry_code)
			VALUES ($1, $2)
			RETURNING company_code, industry_code
			`, [company_code, industry_code]
		);

		return res.status(201).json({ result: result.rows[0] });
	} catch (err) {
		return next(err);
	}
});

/**
 * DELETE /industries/[industry_code]/[company_code]
 * Deletes company/industry record.
 * Should return 404 if company cannot be found.
 * Returns {status: "deleted"} */

router.delete("/:industry_code/:company_code", async (req, res, next) => {
	try {
        const { company_code, industry_code } = req.params;

		await db.query(
			`
			DELETE FROM company_industry
			WHERE company_code=$1 AND industry_code=$2
			`, [company_code, industry_code]
		);

		return res.json({ message: "Deleted" });
	} catch (err) {
		return next(err);
	}
});

module.exports = router;