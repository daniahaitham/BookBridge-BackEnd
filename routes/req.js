console.log(">> req router file loaded");


import express from "express";
import pgClient from "../configration/db.js";

const router = express.Router();

// POST 
//request a bbook 
router.post("/:bookid", async (req, res) => {
    const { bookid } = req.params;     
    const { requesterid, ownerid } = req.body;



  if (!bookid || !requesterid || !ownerid) {
    return res.status(400).json({ error: "bookid, requesterid, ownerid are required" });
  }
  if (String(requesterid) === String(ownerid)) {
    return res.status(400).json({ error: "You cannot request your own book" });
  }

  try {
     const b = await pgClient.query("SELECT id, availability FROM books WHERE id = $1",
      [bookid]
    );
    if (b.rowCount === 0) {
      return res.status(404).json({ error: "Book not found" });
    }   
     if (b.rows[0].availability !== true) {
      return res.status(400).json({ error: "Book is not available for requests" });
    }

     
    const r = await pgClient.query(
      `INSERT INTO requests (bookid, requesterid, ownerid, status)
       VALUES ($1, $2, $3, 'pending')
       RETURNING id, bookid, requesterid, ownerid, status, created_at`,
      [bookid, requesterid, ownerid]
    );

    return res.status(201).json({ request: r.rows[0] });
  } catch (err) {
    console.error("POST /api/req error:", err);
    return res.status(500).json({ error: err.message });
  }
});




router.get("/", async (req, res) => {
  const { ownerid } = req.query;  
  try {
    const r = await pgClient.query(
     `SELECT r.id, r.bookid, r.requesterid, r.ownerid, r.status, r.created_at
       FROM requests r `
    );
    return res.json({ requests: r.rows });
  } catch (err) {
    console.error("GET /api/req/ error:", err);
    return res.status(500).json({ error: err.message });
  }
});



// GET incoming requests by userid 
router.get("/incoming", async (req, res) => {
  const { ownerid } = req.query;  
  try {//I NEED INFO FROM REQ AND OTHER BROM THE RELEATED BOOK ( cover and ritle per each card )
    const r = await pgClient.query(
     `SELECT r.id, r.bookid, r.requesterid, r.ownerid, r.status, r.created_at,
              b.title, b.cover
       FROM requests r
       JOIN books b ON b.id = r.bookid
       WHERE r.ownerid = $1
       ORDER BY r.created_at DESC`, [ownerid]
    );
    return res.json({ requests: r.rows });
  } catch (err) {
    console.error("GET /api/req/incoming error:", err);
    return res.status(500).json({ error: err.message });
  }
});


// PATCH /api/req/:id
router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const r = await pgClient.query(
    "UPDATE requests SET status = $1 WHERE id = $2 RETURNING *",
    [status, id]
  );
  res.json({ request: r.rows[0] });
});



// routes/req.js
router.get("/mine", async (req, res) => {
  const { requesterid } = req.query;
  if (!requesterid) return res.status(400).json({ error: "requesterid is required" });

  const q = `
    SELECT r.id, r.bookid, r.requesterid, r.ownerid, r.status, r.created_at,
           b.title, b.cover
    FROM requests r
    JOIN books b ON b.id = r.bookid
    WHERE r.requesterid = $1
      AND r.status IN ('pending','rejected')
    ORDER BY r.created_at DESC`;
  const r = await pgClient.query(q, [requesterid]);
  res.json({ requests: r.rows });
});

export default router;
