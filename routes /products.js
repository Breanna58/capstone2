const express = require('express'); 
const router = express.Router(); 
//modules reuire? 


router.get('/', async (req, res) => {
try { 
    const products = await productModel.getAllProducts(); 
    res.json(products); 


} catch (err)
 res.status(500).json({error: err.message}); 

}
}); 




router.get ('/:id', (req, res) => {

    res.send(`product with ID: ${req.params.id}`); 


}); 

module.exports = router;



// // server/routes/products.js
// const express = require('express');
// const router = express.Router();
// const productModel = require('../models/productModel');

// router.get('/', async (req, res) => {
//   try {
//     const products = await productModel.getAllProducts();
//     res.json(products);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// module.exports = router;
