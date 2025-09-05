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
    // (optional) verify book exists and owner matches
    const b = await pgClient.query("SELECT id, userid, availability FROM books WHERE id = $1",
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
      [bookid, requesterid, ownerid]///i have this instead of having anither SELECT query it returned the needed dsta
    );

    return res.status(201).json({ request: r.rows[0] });
  } catch (err) {
    console.error("POST /api/requests error:", err);
    return res.status(500).json({ error: err.message });
  }
});

export default router;
