import express from "express";
import pgClient from "../configration/db.js";

const router = express.Router();


//get all books:
 router.get("/all", async (_req, res) => {
  try {
    const r = await pgClient.query(
      `SELECT id, userid, title, author, price, category, description,
              notebyowner, cover, availability, created_at
       FROM books
       ORDER BY created_at DESC`
    );
    return res.json({ books: r.rows });
  } catch (err) {
    console.error("GET /api/books/all error:", err);
    return res.status(500).json({ error: err.message });
  }
});


// POST::  /api/books
router.post("/", async (req, res) => {
  const { //destructing 
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


//get a book by USERid 
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








//get book by id
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const r = await pgClient.query(
      `SELECT id, userid, title, author, price, category, description,
              notebyowner, cover, availability, created_at
       FROM books WHERE id = $1`,
      [id]
    );
    if (r.rows.length === 0) 
      return res.status(404).json({ error: "Book not found" });
    res.json({ book: r.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});






 router.delete("/:id", async (req, res) => {
  const { id } = req.params; //BY PARAMS CUZ: it was  /:d in the req
  const { userid } = req.query; //BY QUEYE CUZ : it was ?userid. ..... 
  if (!userid) return res.status(400).json({ error: "userid is required" });

  try {
    const r = await pgClient.query(
      "DELETE FROM books WHERE id = $1 AND userid = $2 RETURNING id",
      [id, userid]
    );
    if (r.rowCount === 0) {
      return res.status(404).json({ error: "Book not found or not owned by user" });
    }
    return res.json({ ok: true, id: r.rows[0].id }); //in front i use ( if res.ok)
  } catch (err) {
    console.error("DELETE /api/books/:id error:", err);
    return res.status(500).json({ error: err.message });
  }
});



// PUT /api/books/:id?userid=...
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { userid } = req.query;
  if (!userid) return res.status(400).json({ error: "userid is required" });

  // allow partial updates: only fields you send will change
  const {//setting nulls instead of undefined WHEN THEY ARE SENT FROM THE FRONT 
    //THEN IN THE QUERY I WIL HAVE THE REAL DATA FOR THEM ALL 
    title = null,
    author = null,
    price = null,
    category = null,
    description = null,
    notebyowner = null,
    cover = null,
    availability = null,
  } = req.body;

  try {
    const r = await pgClient.query(
      `UPDATE books SET
         title        = $1,
         author       = $2,
         price        = $3,
         category     = $4,
         description  = $5,
         notebyowner  = $6,
         cover        = $7,
         availability = $8
       WHERE id = $9 AND userid = $10
       RETURNING *`,
      [title, author, price, category, description, notebyowner, cover, availability, id, userid]
    );//note :COALESCE is a SQL functoin take arguments , retun the first non null option it see from the arguments i send

    if (r.rows.length === 0) {
      return res.status(404).json({ error: "Book not found or not owned by user" });
    }
    return res.json({ book: r.rows[0] });
  } catch (err) {
    console.error("PUT /api/books/:id error:", err);
    return res.status(500).json({ error: err.message });
  }
});


 
export default router;
