import express from "express";
import pgClient from "../configration/db.js";

const router = express.Router();

// POST::  /api/books
router.post("/", async (req, res) => {
  const {
    userid,         
    title,
    author,
    price,         
    category,      
    description,
    notebyowner,   
    cover,     
    availability
  } = req.body;

  try {
    const result = await pgClient.query(
      `INSERT INTO books
       (userid, title, author, price, category, description, notebyowner, cover, availability)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       RETURNING *`,
      [userid, title, author, price, category, description, notebyowner, cover, availability]
    );
    return res.status(201).json({ book: result.rows[0] });
  } catch (err) {
    console.error("POST /api/books error:", err);
    return res.status(500).json({ error: err.message });
  }
});

router.get("/", async (req, res) => {
  const { userid } = req.query;//grapping the id from the url ( becouse after ? in the front what happen is passing eveytihgn to the requ reuery)


   try {
    if (!userid) {
      return res.status(400).json({ error: "userid is required" });
    }

   
      const r = await pgClient.query(
        `SELECT id, userid, title, author, price, category, description, notebyowner, cover, availability, created_at
         FROM books
         WHERE userid = $1
         ORDER BY created_at DESC`,
        [userid]
      );
      
     
        return res.json({ books: r.rows });
    }
    catch(err){
    console.error("GET /api/books error:", err);
    return res.status(500).json({ error: err.message });
    }
});


//now users when adding abook should be shown in the books i offer section:

export default router;
