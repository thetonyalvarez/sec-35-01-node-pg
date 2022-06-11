\c biztime_test

DROP TABLE IF EXISTS invoices;
DROP TABLE IF EXISTS companies;
DROP TABLE IF EXISTS industries;
DROP TABLE IF EXISTS company_industry;

CREATE TABLE companies (
  code text PRIMARY KEY,
  name text NOT NULL UNIQUE,
  description text
);

CREATE TABLE invoices (
  id serial PRIMARY KEY,
  comp_code text NOT NULL REFERENCES companies ON DELETE CASCADE,
  amt float NOT NULL,
  paid boolean DEFAULT false NOT NULL,
  add_date date DEFAULT CURRENT_DATE NOT NULL,
  paid_date date, 
  CONSTRAINT invoices_amt_check CHECK ((amt > (0)::double precision))
);

CREATE TABLE industries (
    code text PRIMARY KEY,
    industry text NOT NULL unique
);

CREATE TABLE company_industry (
    id serial NOT NULL,
    company_code text NOT NULL,
    FOREIGN KEY (company_code) REFERENCES companies(code) ON DELETE CASCADE,
    industry_code text NOT NULL,
    FOREIGN KEY (industry_code) REFERENCES industries(code) ON DELETE CASCADE,
    PRIMARY KEY (id)
);