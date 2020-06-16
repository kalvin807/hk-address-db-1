# hk-address-db

Hong Kong full address cloned from post service

> Tested in Win10, Node 12, MySQL 5.7

## Run it

> Make sure your database charset is 'utf8mb4'

1. Install packages by using yarn/npm
2. Create Database
3. Clone .env.tmp to .env and fill in db connection detail
4. Create table by `yarn knex migrate:latest`
5. Run the app by `yarn dev` or `npm dev`

## Known Issue

- It is design for running once only, it breaks when you run it 2nd+ time.
- No Test
- No api call fail remedies

## Difficulty

- Address is inconsistent in nature
- HKPost Api is inconsistent
- Api returns in HTML form
- Not very experienced on DB design
