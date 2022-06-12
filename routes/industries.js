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
            i.companies = resp.rows.map((i) => i.code);
        }

		return res.json({ industries: industriesQuery.rows });
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



module.exports = router;