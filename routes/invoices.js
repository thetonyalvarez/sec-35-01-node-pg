/** Routes about invoices. */

const express = require("express");
const { route } = require("../app");
const router = new express.Router();
const db = require("../db");
const ExpressError = require("../expressError");

/**
 * GET /invoices
 * Return info on invoices: like {invoices: [{id, comp_code}, ...]}
 */
router.get("/", async (req, res, next) => {
	try {
		const result = await db.query("SELECT id, comp_code FROM invoices");

		if (result.rows.length === 0) {
			let notFoundError = new ExpressError(
				`No invoices exist in this database.`
			);
			notFoundError.status = 404;
			throw notFoundError;
		}

		return res.json({ invoices: result.rows });
	} catch (err) {
		return next(err);
	}
});

/**
 * GET / invoices / [id]
 * Returns obj on given invoice.
 * If invoice cannot be found, returns 404.
 * Returns {invoice: {id, amt, paid, add_date, paid_date, company: {code, name, description}}}
 **/
router.get("/:id", async (req, res, next) => {
	try {
		const result = await db.query(
			`SELECT id, amt, paid, add_date, paid_date, comp_code FROM invoices WHERE id = $1`,
			[req.params.id]
		);

		if (result.rows.length == 0) {
			let notFoundError = new ExpressError(
				`Invoice id ${req.params.id} not found.`
			);
			notFoundError.status = 404;
			throw notFoundError;
		}

		return res.json({ invoice: result.rows[0] });
	} catch (err) {
		return next(err);
	}
});

/**
 * POST /invoices
 * Adds an invoice.
 * Needs to be passed in JSON body of: {comp_code, amt}
 * Returns: {invoice: {id, comp_code, amt, paid, add_date, paid_date}}
 */
router.post("/", async (req, res, next) => {
	try {
		const { comp_code, amt } = req.body;

		const result = await db.query(
			`INSERT INTO invoices (comp_code, amt) VALUES ($1, $2) RETURNING id, comp_code, amt, paid, add_date, paid_date`,
			[comp_code, amt]
		);

		return res.status(201).json({ invoice: result.rows[0] });
	} catch (err) {
		return next(err);
	}
});

/**
 * PUT /invoices/[id]
 * Updates an invoice.
 * If invoice cannot be found, returns a 404.
 * Needs to be passed in a JSON body of {amt}
 * Returns: {invoice: {id, comp_code, amt, paid, add_date, paid_date}}
 */
router.put("/:id", async (req, res, next) => {
	try {
		let { id } = req.params;
		let { amt, paid } = req.body;
		let paid_date = null;

		const get_invoice = await db.query(
			`
			SELECT paid
			FROM invoices
			WHERE id=$1
			`, [id]
		)

		if (get_invoice.rows.length === 0) {
			let notFoundError = new ExpressError(
				`Invoice id ${req.params.id} not found.`
			);
			notFoundError.status = 404;
			throw notFoundError;
		}

		const currPaidDate = get_invoice.rows[0].paid_date

		if (!currPaidDate && paid) {
			paid_date = new Date();
		}
		else if (!paid) {
			paid_date = null
		}
		else {
			paid_date = currPaidDate;
		}

		const result = await db.query(
			`
			UPDATE invoices SET amt=$2, paid_date=$3, paid=$4 
			WHERE id=$1 
			RETURNING id, comp_code, amt, paid, add_date, paid_date
			`, [id, amt, paid_date, paid]
		);


		return res.status(201).json({ invoice: result.rows[0] });
	} catch (err) {
		return next(err);
	}
});

/**
 * DELETE /invoices/[id]
 * Deletes an invoice.
 * If invoice cannot be found, returns a 404.
 * Returns: {status: "deleted"}
 */
router.delete("/:id", async function (req, res, next) {
	try {
		const result = await db.query(`DELETE FROM invoices WHERE id=$1`, [
			req.params.id,
		]);

		return res.json({ message: "Deleted" });
	} catch (err) {
		return next(err);
	}
});

module.exports = router;
