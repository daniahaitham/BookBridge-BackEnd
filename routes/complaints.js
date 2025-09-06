import express from "express";
import pgClient from "../configration/db.js";
import adminAuth from "../middlewares/adminAuth.js";

const router = express.Router();

// POST /api/complaints
router.post("/", async (req, res) => {
  const { userid, subject, description, priority } = req.body;//dont forget the grapping of the data here is by destructuring 

  if (!subject || !description) {
    return res.status(400).json({ error: "subject and description are required" });
  }

  try {
    const q = `
        INSERT INTO complaints (userid, subject, description, priority, status, actiontaken)
        VALUES ($1, $2, $3, $4, 'open', NULL)
        RETURNING id, userid, subject, description, priority, status, actiontaken, created_at
        `;
    const r = await pgClient.query(q, [userid , subject, description, priority]);
        //this is js obj whre i sent this q to the server 


    res.status(201).json({ complaint: r.rows[0] });//convert js to json
  } catch (e) {
    console.error("POST /api/complaints error:", e);
    res.status(500).json({ error: "failed to create complaint" });
  }
});

router.get("/", async (req, res) => {
  try {
    const q = "SELECT * FROM complaints ORDER BY created_at DESC";
    const r = await pgClient.query(q);
    res.json({ complaints: r.rows });
  } catch (e) {
    res.status(500).json({ error: "failed to fetch complaints" });
  }
});


//ONLY FOR ADMINS!
router.get("/", adminAuth, async (req, res) => {
  try {
    const q = "SELECT * FROM complaints ORDER BY created_at DESC";
    const r = await pgClient.query(q);
    res.json(r.rows);
  } catch (e) {
    res.status(500).json({ error: "failed to fetch complaints" });
  }
});


export default router;
