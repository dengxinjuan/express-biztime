process.env.NODE_ENV= "test";
const request = require("supertest");
const app= require("../app");
const db = require("../db");

let testCompany;

beforeEach(async function () {
    let result = await db.query(
      `INSERT INTO companies (code,name,description) VALUES ('spr','springboard','coding education company.') RETURNING code,name,description`
    );
    testCompany = result.rows[0];
  });
  
  afterEach(async () => {
    await db.query('DELETE FROM companies');
  });
  
  afterAll(async () => {
    //close db connection
    await db.end();
  });

// test return companies
  describe('GET /companies', function () {
    test('Gets a list of companies', async function () {
      const response = await request(app).get(`/companies`);
      expect(response.body).toEqual({"company":[{"code":testCompany.code,"name":testCompany.name}]});
    });
  });


  describe('GET /companies/:code', function () {
    test('Gets a company', async function () {
      const response = await request(app).get(`/companies/${testCompany.code}`);
      expect(response.statusCode).toEqual(200);
     
      expect(response.body).toEqual({"company":testCompany});
    });
  });

  //test post route
  describe('POST /companies', function () {
    test('Create a company', async function () {
      const response = await request(app).post(`/companies`).send({
        code: 'apple',
        name: 'iPad Air',
        description: 'Liquid Retina Display with A14 Bionic',
      });
      expect(response.statusCode).toEqual(201);
      expect(response.body).toEqual({"company":{
        code: 'apple',
        name: 'iPad Air',
        description: 'Liquid Retina Display with A14 Bionic',
      }});
    });
  });
 


//test delete route

describe('DELETE /companies/:code', function () {
    test('Delete company', async function () {
      const response = await request(app).delete(
        `/companies/${testCompany.code}`
      );
      expect(response.statusCode).toEqual(200);
      expect(response.body).toEqual({ "message":"deleted" });
    });
  });



  describe('PUT /companies/:code', function () {
    test("Update company's fields", async function () {
      const response = await request(app)
        .patch(`/companies/${testCompany.code}`)
        .send({
          code: 'windows',
          name: 'Windows 11',
          description: 'Concept 2021',
        });
      expect(response.statusCode).toEqual(200);
      console.log(response.body);
      expect(response.body).toEqual( {
        'company': [ { code: 'spr', name: 'Windows 11', description: 'Concept 2021' } ]
      });
    });
    test('Responds with 404 code Not Found', async function () {
      const response = await request(app).patch(`/companies/kkkk`);
      expect(response.statusCode).toEqual(404);
    });
  });
