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