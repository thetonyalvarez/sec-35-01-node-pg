# BizTime

-   [Installation and Setup](#installation-and-setup)

## Installation and Setup

This project uses PostgreSQL for backend storage, and Node.JS for front-end rendering.

### Install packages

Run `npm install` to install all dependencies.

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

### Tables

| Schema | Name            | Type     | Owner       |
| ------ | --------------- | -------- | ----------- |
| public | companies       | table    | tonyalvarez |
| public | invoices        | table    | tonyalvarez |
| public | invoices_id_seq | sequence | tonyalvarez |

#### Companies Table

| code  | name           | description   |
| ----- | -------------- | ------------- |
| apple | Apple Computer | Maker of OSX. |
| ibm   | IBM            | Big blue.     |

#### Invoices Table

| id  | comp_code | amt | paid | add_date   | paid_date  |
| --- | --------- | --- | ---- | ---------- | ---------- |
| 1   | apple     | 100 | f    | 2022-05-30 |
| 2   | apple     | 200 | f    | 2022-05-30 |
| 3   | apple     | 300 | t    | 2022-05-30 | 2018-01-01 |
| 4   | ibm       | 400 | f    | 2022-05-30 |

## Roadmap

Items and features that I'd like to implement later.

-   Tests for SQL database
    -   Ex. if `company` is entered with no `code` or `name`, throw error.
