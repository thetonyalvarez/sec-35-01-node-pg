# BizTime

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
