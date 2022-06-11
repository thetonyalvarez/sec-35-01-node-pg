/** Routes about companies. */

const express = require("express");
const router = new express.Router();
const db = require("../db");
const ExpressError = require("../expressError");

/**
 * GET /industries
 * Returns list of industries and company codes associated with that industry, like {industries: [{code, name, companies: [code]}, ...]}
 */


/**
 * POST /industries/code
 * Adds an industry.
 * Needs to be given JSON like: {code, name}
 * Returns obj of new company: {industry: {code, name}}
 */



module.exports = router;