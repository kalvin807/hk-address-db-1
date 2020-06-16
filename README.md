# hk-address-db

Hong Kong full address cloned from post service

> Tested in Win10, Node 12, MySQL 5.7

## Run it

> Make sure your database charset is 'utf8mb4'

1. Install packages by using yarn/npm
2. Create Database
3. Clone .env.tmp to .env and fill in db connection detail
4. Create table by `yarn knex migrate:latest`
5. Run the app by `yarn start` or `npm start`

## Known Issue

- No Test (Decided not to go for it as this look like a script more then a complete software, instead try to be as information and easy to debug by comment and logging)
- No api call fail remedies
- Poorly written valid address fetcher (many edge case)
- too many await, context switch wasted many time
- It is slow, mainly bottleneck by pokeguide api and nested way to search valid address

## Difficulties

- Address is inconsistent in nature
- HKPost Api is inconsistent
- Api returns in HTML form
- Not very experienced on DB design
- Ditto for async design

## Work Time

Around 4-5 hrs per day as there are some preoccupied events
