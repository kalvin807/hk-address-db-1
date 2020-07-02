# hk-address-db

Hong Kong full address cloned from post service

> Tested in Win10, Node 12, MySQL 5.7
> Beware! You might get banned from hkpost address service or its cloudfront CDN service

## Run it

> Make sure your database charset is 'utf8mb4'

1. Install packages by using yarn/npm
2. Create Database
3. Clone .env.tmp to .env and fill in db connection detail
4. Create table by `yarn knex migrate:latest`
5. Run the app by `yarn start` or `npm start`

## To-do
- Optimize latlng search as discussed in [here](http://mysql.rjweb.org/doc.php/latlng#representation_choices)

## Known Issue

- No Test (Decided not to go for it as this look like a script more then a complete software, instead try to be more informative and easy to debug by commenting and logging)
- No api call fail remedies
- Poorly written valid address fetcher (many edge case)
- too many await, context switch wasted many time
- It is slow, mainly bottleneck by pokeguide api and nested way to search valid address (also number of addresses is huge, 2m according to census)

## Difficulties

- Address is inconsistent in nature
- HKPost Api is inconsistent
- Api returns in HTML form
- Not very experienced on DB design
- Ditto for async design

## Work Time

Around 4-5 hrs per day as there are some preoccupied events

## DB Schema

```
regions
|- id (integer) [PK]
|- en_name (string)
|- zh_name (string)

districts
|- id (integer) [PK]
|- en_name (string)
|- zh_name (string)

districtLocations
|- id (integer) [PK]
|- district (integer) [FK: districts.id]
|- region (integer) [FK: regions.id]

streets
|- id (integer) [PK]
|- en_name (string)
|- zh_name (string)

streetNos
|- id (integer) [PK]
|- name (string)

streetLocations
|- id (number) [PK]
|- street (integer) [FK: streets.id]
|- district (integer) [FK: districts.id]

streetNoLocations
|- id (integer) [PK]
|- streetLocation (integer) [FK: streetLocations.id]
|- streetNo (integer) [FK: streetNos.id]

estates
|- id (integer) [PK]
|- en_name (string)
|- zh_name (string)

phases
|- id (integer) [PK]
|- en_name (string)
|- zh_name (string)

estateLocations
|- id (integer) [PK]
|- estate (integer) [FK: estates.id]
|- district (integer) [FK: districts.id]
|- streetNo (integer) [FK: streetNos.id]
|- street (integer) [FK: streets.id]

phaseLocations
|- id (integer) [PK]
|- phase (integer) [FK: phases.id]
|- estateLocation (integer) [FK: estateLocations.id]

buildings
|- id (integer) [PK]
|- en_name (string)
|- zh_name (string)

buildingLocations
|- id (integer) [PK]
|- building (integer) [FK: buildings.id]
|- district (integer) [FK: districts.id]
|- street (integer) [FK: streets.id]
|- streetNo (integer) [FK: streetNos.id]
|- estate (integer) [FK: estates.id]
|- phase (integer) [FK: phases.id]

latlngs
|- id (integer) [PK]
|- buildingLocation (integer) [FK: buildingLocations.id]
|- lat (float)
|- lng (float)
|- raw (JSON)
|- remark (TEXT)

latlngs
|- id (integer) [PK]
|- buildingLocation (integer) [FK: buildingLocations.id]
|- latlng (integer) [FK: latlngs.id]
|- result (string)
|- match (Boolean)
|- remark (TEXT)

floors
|- id (integer) [PK]
|- en_name (string)
|- zh_name (string)

units
|- id (integer) [PK]
|- en_name (string)
|- zh_name (string)

addresses
|- id (integer) [PK]
|- buildingLocation (integer) [FK: buildingLocations.id]
|- floor (integer) [FK: floor.id]
|- unit (integer) [FK: units.id]

validAddresses
|- id (integer) [PK]
|- address (integer) [FK: addresses.id]
|- en_name (string)
|- zh_name (string)
|- remark (TEXT)
```
