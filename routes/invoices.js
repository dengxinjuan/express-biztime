const express = require("express")
const ExpressError = require("../expressError")
const router = new express.Router();
const db = require("../db")


//return all invocies
router.get('/', async (req, res, next) => {
    try {
      const results = await db.query(`SELECT id,comp_code FROM invoices`);
      return res.json({ "invoices": results.rows })
    } catch (e) {
      return next(e);
    }
  })

// get specific invoice by id

router.get('/:id', async (req, res, next) => {
    try {
      const results = await db.query(`SELECT i.id, 
      i.comp_code, 
      i.amt, 
      i.paid, 
      i.add_date, 
      i.paid_date, 
      c.name, 
      c.description 
FROM invoices AS i
 INNER JOIN companies AS c ON (i.comp_code = c.code)  
WHERE id = $1`,[req.params.id]);
      if (results.rows.length === 0) {
        throw new ExpressError(`Not valid invoice id: ${req.params.id}`, 404)
      };
      let data= results.rows[0];
      
      return res.json({"invoice":{
        id: data.id,
        company: {
          code: data.comp_code,
          name: data.name,
          description: data.description,
        },
        amt: data.amt,
        paid: data.paid,
        add_date: data.add_date,
        paid_date: data.paid_date,
      }})
    } catch (e) {
      return next(e);
    }
  })

// invoice post adds an invoice

router.post('/', async (req, res, next) => {
    try {
      const {comp_code,amt} = req.body;

      const results = await db.query(`INSERT INTO invoices(comp_code,amt) 
      VALUES ($1,$2) Returning id,comp_code,amt,paid,add_date,paid_date`,[comp_code,amt]);
      return res.status(201).json({ "invoice": results.rows[0]})
    } catch (e) {
      return next(e);
    }
  })

//invoice put update

router.patch('/:id', async (req, res, next) => {
    try {
      const {amt} = req.body;
      const results = await db.query(`UPDATE invoices SET amt=$2 Where id =$1 RETURNING id,comp_code,amt,paid,add_date,paid_date`,[req.params.id, amt]);
      if (results.rows.length === 0) {
        throw new ExpressError(`Not valid invoice code: ${req.params.id}`, 404)
      }
      return res.json({ "invoice": results.rows })
    } catch (e) {
      return next(e);
    }
  })

  //delete

  router.delete('/:id', async (req, res, next) => {
    try {
      const results = await db.query(`DELETE FROM invoices Where id =$1 RETURNING id`,[req.params.id]);
      if (results.rows.length === 0) {
        throw new ExpressError(`Not valid invoice id: ${req.params.id}`, 404)
      }
      return res.json({ "message":"deleted"})
    } catch (e) {
      return next(e);
    }
  })




module.exports = router;