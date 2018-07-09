var express = require('express');
var router = express.Router();
var Product = require('../models/product');

/* GET home page. */
router.get('/', function (req, res, next) {
    Product.find(function (err, docs) {
        var productChunks = [];
        var chunkSize = 3;
        for (var i = 0; i < docs.length; i += chunkSize) {
            productChunks.push(docs.slice(i, i + chunkSize));
        }
        res.render('shop/index', { title: 'Shopping Cart', products: productChunks });
    });
});

router.get('/addNewProduct', function (req, res) {
    res.render('shop/addProduct', { title: 'Page Add' });
});

router.post('/addNewProduct', function (req, res) {
    var product = new Product(req.body);

    product.save(function (err) {
        if (err) {
            console.log(err);
            res.render("shop/addProduct");
        } else {
            console.log("Successfully created an product.");
            res.redirect("/");
        }
    });
});

router.get('/list', function (req, res) {
    Product.find(function (err, prods) {
        res.render('shop/list', { title: 'All Products', products: prods });
    });

});

router.post('/delete/:id', function (req, res) {
    Product.remove({ _id: req.params.id }, function (err) {
        if (err) {
            console.log(err);
        } else {
            console.log("Product deleted!");
            res.redirect("/list");
        }
    });
});

router.get('/edit/:id', function (req, res) {
    Product.findOne({ _id: req.params.id }).exec(function (err, prods) {
        if (err) {
            console.log("Error:", err);
        } else {
            res.render('shop/edit', { title: 'All Products', products: prods });
        }
    })
})

router.post('/updateProduct/:id', function (req, res) {
    Product.findByIdAndUpdate(req.params.id,
        {
            $set:
            {
                imagePath: req.body.imagePath,
                title: req.body.title,
                description: req.body.description,
                price: req.body.price
            }
        }, { new: true },
        function (err, products) {
            if (err) {
                console.log(err);
                res.render("shop/edit", { products: req.body });
            }
            res.redirect("/list");
        });
});

// router.post('/addNewProduct', function (req, res) {
//     var product = new Product(req.body);

//     product.save(function (err) {
//         if (err) {
//             console.log(err);
//             res.render("shop/addProduct");
//         } else {
//             console.log("Successfully created an product.");
//             res.redirect("/");
//         }
//     });
// });

module.exports = router;

