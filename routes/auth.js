// routes/auth.js
import express from "express"; //to crreate routs
import db from "../configration/db.js"; //my cleint conection

const router = express.Router(); //to be able to use the methods 

// POST /api/auth/signup
 router.post("/signup", async (req, res) => {
  const { name, email, phonenum, password } = req.body;  //extracting fields from the request body 
  const exists = await db.query("SELECT * FROM users WHERE email = $1", [email]);
  if (exists.rows.length > 0) return res.status(400).json({ message: "User already exists" });


  const result = await db.query(
`INSERT INTO users (name, email, phonenum, password)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, phonenum, is_admin, created_at`,
      [name, email, phonenum, password]
  );
  res.status(201).json({ user: result.rows[0] });
 
});


// POST /api/auth/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const result = await db.query(
    "SELECT * FROM users WHERE email = $1 AND password = $2",
    [email, password]
   );

   //no user matches the returened.
  if (result.rows.length === 0) return res.status(401).json({ message: "Invalid credentials" });
  res.json({ user: result.rows[0] });//return a user.
});

export default router;
