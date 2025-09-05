import express from 'express';
import pgClient from "../configration/db.js"; 

//ALL ENDPOINTS WILL BE INCLUDED HERE

//USING THOSE METHODS FROM MY BROWSER --> IT SEND BODY(JSON)
// post to create new row in table
// put to replace an exsisting row full record  
// patch to replace spsific part of record

// get read only 
//delete to remove 

 
const router = express.Router();//Obejct to hold group od routs to be able to use methods 
 // GET all users : localhost:5000/api/users
router.get("/", async (req, res) => { 
     try {
        const result = await pgClient.query("SELECT * FROM users"); //this return a promice that include all data even not needed as the metadata
        res.json(result.rows);//from row data to Json
    } catch (err) {
        res.status(500).json({ error: "Internal server error" });
    }
});

 

// GET one user : localhost:5000/api/users/5
router.get("/:id", async (req, res) => { 
        try {
        const result = await pgClient.query("SELECT * FROM users WHERE id = $1", [req.params.id]); //1 IS A PLACEHO,DER 
        if (result.rows.length === 0) {
            res.status(404).json({ message: "User not found" });
        }
        res.json(result.rows[0]);// ciz the unique id will always be the first 
    } catch (err) {
        res.status(500).json({ error: "Internal server error" });
    }
});


// POST : localhost:5000/api/users/
//here the resul is body including the data feilds 
router.post("/", async (req, res) => {
    const { name, email , phonenum ,password, is_admin } = req.body;
    // const name = req.body.name;
    // const age=req.body.age;

    try {
        const result = await pgClient.query(
            "INSERT INTO users (name, email, phonenum, password, is_admin) VALUES ($1, $2, $3, $4, $5) RETURNING *", [name, email, phonenum, password, is_admin]
        );
        //console.log(result.rows);

        res.status(200).json(result.rows[0]);//always returngin is by arrays even if it contain one only 
    } catch (err) {
        res.status(500).json({ error: err });
    }

})


// PUT : localhost:5000/api/users/5
router.put("/:id", async (req, res) => {
    const { name, email , phonenum ,password, is_admin } = req.body;
    try {
    const result = await pgClient.query(
      "UPDATE users SET name = $1, email = $2, phonenum = $3, password = $4, is_admin = $5 WHERE id = $6 RETURNING *",
 
      [name, email, phonenum, password, is_admin, req.params.id]

    );
     if (result.rows.length === 0) {
          return res.status(404).json({ message: "User not found" });
        }
         console.log(result.rows);
        res.json(result.rows[0]);
  } catch (err) {
    console.error("PUT /users/:id error:", err);
    return res.status(500).json({ error: err.message, detail: err.detail });
  }
});





// DELETE user : localhost:5000/api/users/5
router.delete("/:id", async (req, res) => {
  try {
    const result = await pgClient.query(
      "DELETE FROM users WHERE id = $1 RETURNING *",[req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User deleted", user: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});



export default router;
