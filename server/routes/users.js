const express = require('express');
const router = express.Router();

router.get("/test", (req, res) => {
    const name = req.query.name;
    res.json({ message: `hi from the server, ${name}!!` });
});

module.exports = router; 
