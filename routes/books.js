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


// keep /all above so it doesn't get caught by :id
router.get("/all", async (_req, res) => {
  const r = await pgClient.query(
    `SELECT id, userid, title, author, price, category, description,
            notebyowner, cover, availability, created_at
     FROM books
     ORDER BY created_at DESC`
  );
  res.json({ books: r.rows });
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


 router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  const { userid } = req.query;
  if (!userid) return res.status(400).json({ error: "userid is required" });

  try {
    const r = await pgClient.query(
      "DELETE FROM books WHERE id = $1 AND userid = $2 RETURNING id",
      [id, userid]
    );
    if (r.rowCount === 0) {
      return res.status(404).json({ error: "Book not found or not owned by user" });
    }
    return res.json({ ok: true, id: r.rows[0].id });
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
  const {
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
         title        = COALESCE($1, title),
         author       = COALESCE($2, author),
         price        = COALESCE($3, price),
         category     = COALESCE($4, category),
         description  = COALESCE($5, description),
         notebyowner  = COALESCE($6, notebyowner),
         cover        = COALESCE($7, cover),
         availability = COALESCE($8, availability)
       WHERE id = $9 AND userid = $10
       RETURNING *`,
      [title, author, price, category, description, notebyowner, cover, availability, id, userid]
    );

    if (r.rows.length === 0) {
      return res.status(404).json({ error: "Book not found or not owned by user" });
    }
    return res.json({ book: r.rows[0] });
  } catch (err) {
    console.error("PUT /api/books/:id error:", err);
    return res.status(500).json({ error: err.message });
  }
});


//now users when adding abook should be shown in the books i offer section:

export default router;
