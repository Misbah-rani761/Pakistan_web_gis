
const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Database connection
const pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "gis_db",
    password: "1234",
    port: 5432
});

// Check database connection
pool.query("SELECT to_regclass('public.parks') AS table_name")
    .then(result => {
        console.log("Database connected.");
        console.log("Parks table:", result.rows[0].table_name);
    })
    .catch(error => {
        console.error("Database connection error:", error.message);
    });

// Home page
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

// Get parks and filter by city, type or name
app.get("/api/parks", async (req, res) => {
    try {
        const { city, park_type, search } = req.query;

        let sql = `
            SELECT id, name, park_type, city,
                   ST_X(location) AS longitude,
                   ST_Y(location) AS latitude
            FROM public.parks
            WHERE 1=1
        `;
        const values = [];

        if (city) {
            values.push(city);
            sql += ` AND city = $${values.length}`;
        }

        if (park_type) {
            values.push(park_type);
            sql += ` AND park_type = $${values.length}`;
        }

        if (search) {
            values.push(`%${search}%`);
            sql += ` AND name ILIKE $${values.length}`;
        }

        sql += " ORDER BY id";

        const result = await pool.query(sql, values);
        res.json(result.rows);
    } catch (error) {
        console.error("Fetch error:", error.message);
        res.status(500).json({ error: error.message });
    }
});

// Add a park
app.post("/api/parks", async (req, res) => {
    try {
        const { name, park_type, city, latitude, longitude } = req.body;

        if (
            typeof name !== "string" || !name.trim() ||
            typeof park_type !== "string" || !park_type.trim() ||
            typeof city !== "string" || !city.trim() ||
            latitude === undefined || longitude === undefined ||
            !Number.isFinite(Number(latitude)) ||
            !Number.isFinite(Number(longitude)) ||
            Number(latitude) < -90 || Number(latitude) > 90 ||
            Number(longitude) < -180 || Number(longitude) > 180
        ) {
            return res.status(400).json({
                error: "Enter valid park details and coordinates."
            });
        }

        const result = await pool.query(
            `INSERT INTO public.parks
             (name, park_type, city, location)
             VALUES ($1, $2, $3,
                     ST_SetSRID(ST_MakePoint($4, $5), 4326))
             RETURNING id, name, park_type, city`,
            [
                name.trim(),
                park_type.trim(),
                city.trim(),
                Number(longitude),
                Number(latitude)
            ]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error("Insert error:", error.message);
        res.status(500).json({ error: error.message });
    }
});

// Update a park
app.put("/api/parks/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { name, park_type, city } = req.body;

        if (!Number.isInteger(id) || id < 1) {
            return res.status(400).json({ error: "Invalid park ID." });
        }

        if (
            typeof name !== "string" || !name.trim() ||
            typeof park_type !== "string" || !park_type.trim() ||
            typeof city !== "string" || !city.trim()
        ) {
            return res.status(400).json({
                error: "Name, park type and city are required."
            });
        }

        const result = await pool.query(
            `UPDATE public.parks
             SET name = $1, park_type = $2, city = $3
             WHERE id = $4
             RETURNING id, name, park_type, city`,
            [name.trim(), park_type.trim(), city.trim(), id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Park not found." });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error("Update error:", error.message);
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`WebGIS running at http://localhost:${PORT}`);
});
