
# Pakistan Parks WebGIS

## 1. Project Overview
This project is a database-driven WebGIS application for managing and visualizing park locations. It displays park locations on an interactive map and allows users to search, filter, add, and update park records.

## 2. Technologies Used
- HTML and CSS
- JavaScript
- Leaflet.js
- Node.js and Express.js
- PostgreSQL
- PostGIS
- OpenStreetMap

## 3. Main Features
- Interactive park map
- Search parks by name
- Filter parks by city and park type
- Add new park records
- Update existing park records
- Store spatial coordinates in PostgreSQL/PostGIS
- Validate form input and display errors

## 4. Database
Database name: gis_db  
Table name: public.parks  
Spatial column: location  
Geometry type: Point  
Coordinate Reference System: EPSG:4326

## 5. How to Run
1. Install Node.js and PostgreSQL with PostGIS.
2. Configure the database connection in server.js.
3. Install dependencies using `npm install`.
4. Start the application using `node server.js`.
5. Open http://localhost:3000 in a browser.

## 6. API Endpoints
- GET /api/parks — retrieve park records
- POST /api/parks — add a park
- PUT /api/parks/:id — update a park

## 7. Conclusion
The application demonstrates how spatial database records can be accessed through an API and displayed on an interactive web map.
