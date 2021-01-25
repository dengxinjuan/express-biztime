const express = require("express")
const ExpressError = require("../expressError")
const router = new express.Router();
const db = require("../db")

//return all companies 
router.get('/', async (req, res, next) => {
    try {
      const results = await db.query(`SELECT code,name FROM companies`);
      return res.json({ "company": results.rows })
    } catch (e) {
      return next(e);
    }
  })


//return company by code
router.get('/:code', async (req, res, next) => {
    try {
      const results = await db.query(`SELECT code,name,description FROM companies Where code =$1`,[req.params.code]);
      if (results.rows.length === 0) {
        throw new ExpressError(`Not valid company code: ${req.params.code}`, 404)
      }

      const invResult = await db.query(
        `SELECT id
         FROM invoices
         WHERE comp_code = $1`,
      [req.params.code]);

      const company = results.rows[0];
      //const invoices = invResult.rows;

      //company.invoices = invoices.map(inv => inv.id);

      return res.json({ "company": company})
    } catch (e) {
      return next(e);
    }
  })

  //post companies add a company

  router.post('/', async (req, res, next) => {
    try {
      const {code,name,description} = req.body;

      const results = await db.query(`INSERT INTO companies (code,name,description) 
      VALUES ($1,$2,$3) Returning code,name,description`,[code,name,description]);
      return res.status(201).json({ "company": results.rows[0]})
    } catch (e) {
      return next(e);
    }
  })


//update a company by code

router.patch('/:code', async (req, res, next) => {
    try {
      const {name,description} = req.body;
      const results = await db.query(`UPDATE companies SET name=$2,description=$3 Where code =$1 RETURNING code,name,description`,[req.params.code, name,description]);
      if (results.rows.length === 0) {
        throw new ExpressError(`Not valid company code: ${req.params.code}`, 404)
      }
      return res.json({ "company": results.rows })
    } catch (e) {
      return next(e);
    }
  })

  //delete 

  router.delete('/:code', async (req, res, next) => {
    try {
      const results = await db.query(`DELETE FROM companies Where code =$1 RETURNING code`,[req.params.code]);
      if (results.rows.length === 0) {
        throw new ExpressError(`Not valid company code: ${req.params.code}`, 404)
      }
      return res.json({ "message":"deleted" })
    } catch (e) {
      return next(e);
    }
  })

  




  module.exports = router;