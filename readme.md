# BizTime

This is an invoice tracking app. Each invoice is associated with a company.

There can be many invoices for one company, but there cannot be many companies for one invoice.

You can create add, edit or delete companies, and add, edit or delete invoices for that company.

If you delete a company, all associated invoices with that company will also be deleted.

#

-   [Installation and Setup](#installation-and-setup)
    -   [Install packages](#install-packages)
    -   [Start your local database server](#start-your-local-database-server)
    -   [Create databases](#create-databases)
-   [Using the app](#using-the-app)
    -   [Companies](#companies)
        -   [View all Companies](#view-all-companies)
        -   [Edit a Company](#edit-a-company)
        -   [Add a Company](#add-a-company)
        -   [Update a Company](#update-a-company)
        -   [Delete a Company](#delete-a-company)
    -   [Invoices](#invoices)
        -   [View all Invoices](#view-all-invoices)
        -   [Edit an Invoice](#edit-an-invoice)
        -   [Add an Invoice](#add-an-invoice)
        -   [Update an Invoice](#update-an-invoice)
        -   [Delete an Invoice](#delete-an-invoice)
-   [Roadmap](#roadmap)

#

## Installation and Setup

This project uses PostgreSQL for backend storage, and Node.JS for front-end rendering.

### Install packages

Run `npm install` to install all dependencies.

### Start your local database server

Start your local database server as you'll be creating 2 new databases for this app.

### Create databases

_For production:_
Create a database named `biztime`, then seed the data from `data.sql`:

```console
$ createdb biztime
$ psql < data.sql
```

_For testing:_
Create a database named `biztime_test`, then seed the data from `data_test.sql`:

```console
$ createdb biztime_test
$ psql < data_test.sql
```

## Using the app

### Companies

###$ View all Companies

To view all companies in the database, make a `GET` request to `/companies`:

```console
$ curl http://localhost:5000/companies
```

##### Companies Table

| code  | name           | description   |
| ----- | -------------- | ------------- |
| apple | Apple Computer | Maker of OSX. |
| ibm   | IBM            | Big blue.     |

#### Edit a Company

To view a company by its company `code`, make a `GET` request to `/companies/[COMPANY CODE]`:

```console
$ curl http://localhost:5000/companies/[COMPANY CODE]
```

#### Add a Company

To add a new company, make a `POST` request to `/companies` with the following information in the body of the request:

```json
{
	"code": "company_code",
	"name": "company_name",
	"description": "description of company"
}
```

```console
$ curl http://localhost:5000/companies -X POST
```

#### Update a Company

To update an existing company, make a `PUT` request to `/companies/[COMPANY CODE]` with the following information in the body of the request:

```json
{
	"name": "new_company_name",
	"description": "new description of company"
}
```

```console
$ curl http://localhost:5000/companies/[COMPANY CODE] -X PUT
```

#### Delete a Company

To delete a company, make a `DELETE` request to `/companies/[COMPANY CODE]`:

```console
$ curl http://localhost:5000/companies/[COMPANY CODE] -X DELETE
```

### Invoices

#### View all Invoices

To view all invoices in the database, make a `GET` request to `/invoices`:

```console
$ curl http://localhost:5000/invoices
```

##### Invoices Table

| id  | comp_code | amt | paid | add_date   | paid_date  |
| --- | --------- | --- | ---- | ---------- | ---------- |
| 1   | apple     | 100 | f    | 2022-05-30 |
| 2   | apple     | 200 | f    | 2022-05-30 |
| 3   | apple     | 300 | t    | 2022-05-30 | 2018-01-01 |
| 4   | ibm       | 400 | f    | 2022-05-30 |

#### Edit an Invoice

To view an invoice by its invoice ID, make a `GET` request to `/invoices/[INVOICE ID]`:

```console
$ curl http://localhost:5000/invoices/[INVOICE ID]
```

#### Add an Invoice

To add a new invoice, make a `POST` request to `/invoices` with the following information in the body of the request:

```json
{
	"comp_code": "company_code",
	"amt": 100
}
```

```console
$ curl http://localhost:5000/invoices -X POST
```

#### Update an Invoice

To update an existing invoice, make a `PUT` request to `/invoices/[INVOICE ID]` with the new amount you'd like to update the invoice for:

```json
{
	"amt": 3000
}
```

```console
$ curl http://localhost:5000/invoices/[INVOICE ID] -X PUT
```

#### Delete an Invoice

To delete an invoice, make a `DELETE` request to `/invoices/[INVOICE ID]`:

```console
$ curl http://localhost:5000/invoices/[INVOICE ID] -X DELETE
```

#

## Roadmap

Items and features that I'd like to implement later.

-   Tests for SQL database
    -   Ex. if `company` is entered with no `code` or `name`, throw error.
#

## Current Issues

- Integrated testing fails
    - `companies.test.js` and `invoices.test.js` pass when run alone, but when jest is run to run all tests, testing fails