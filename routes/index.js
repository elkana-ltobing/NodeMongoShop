var express = require('express');
var router = express.Router();
var Product = require('../models/product');
var formidable = require('formidable');
var Cart = require('../models/cart');

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

router.get('/add-to-cart/:id', function (req, res, next){
    var productId = req.params.id;
    var cart = new Cart(req.session.cart ? req.session.cart : {})

    Product.findById(productId, function (err, product){
        cart.add(product, product.id);
        req.session.cart = cart;
        res.redirect('/');
    })
})

router.get('/shopping-cart', function (req, res, next){
    if (!req.session.cart) {
        return res.render('shop/shopping-cart', {products: null})
    }
    var cart = new Cart(req.session.cart);
    res.render('shop/shopping-cart', {products: cart.generateArray(), totalPrice: cart.totalPrice})
})

router.get('/reduce/:id', function (req, res, next){
    var productId = req.params.id;
    var cart = new Cart(req.session.cart ? req.session.cart: {})

    cart.reduceByOne(productId);
    req.session.cart = cart;
    res.redirect('/shopping-cart')
})

router.get('/remove/:id', function (req, res, next){
    var productId = req.params.id;
    var cart = new Cart(req.session.cart ? req.session.cart: {})

    cart.removeItem(productId);
    req.session.cart = cart;
    res.redirect('/shopping-cart')
})

router.get('/addNewProduct', function (req, res) {
    res.render('shop/addProduct', { title: 'Page Add' });
});

router.get('/logout', function(req, res, next){
    session = req.session;
    session.destroy(function(err){
        res.redirect('/')
    })
})

router.post("/addNewProduct", function (req, res) {
    var form = new formidable.IncomingForm();
    var fullFilename;
    var product = new Product();

    form.parse(req, function (err, fields) {
        product = new Product(fields);
        console.log('Product:' + product);
        console.log('fullfilename:' + fullFilename);
        product.imagePath = fullFilename;
        product.save(function (err) {
            if (err) {
                console.log(err);
                res.render("shop/addProduct");
            } else {
                console.log("Successfully created a Product");
                res.redirect("/");
            }
        });
    })
    form.on('file', function (name, file, fields) {
        product = new Product(fields);
        console.log('Product:' + product);
        console.log('Uploaded:' + file.name);
        fullFilename = './photo_uploads/' + file.name;
    });

    form.on("fileBegin", function (name, file) {
        file.path = process.cwd() + '/public/photo_uploads/' + file.name;
    })
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
    var form = new formidable.IncomingForm();
    var id = req.params.id;
    var fullfilename;

    form.parse(req, function (err, fields) {
        console.log(fields);
        Product.findById(id, function (err, doc) {
            if (err) {
                console.log("Find by id: " + err);
                res.redirect('/edit/' + id);
            }
            console.log("Full filename: " + fullfilename);
            if (!fullfilename) {
                doc.imagePath = fields.imagePath;
            }
            else {
                doc.imagePath = fullfilename;
            }
            doc.title = fields.title;
            doc.description = fields.description;
            doc.price = fields.price;
            doc.save(function (err) {
                if (err) {
                    console.log("error sace: " + err);
                    res.redirect('/edit/' + id);
                } else {
                    console.log("successfully saved edited product");
                    res.redirect('/list');
                }
            })
        })
    })

    form.on('file', function (name, file, fields) {
        console.log('Filename ' + file.name);
        if (file.name) {
            fullfilename = './photo_uploads/' + file.name;
            if (file.name) {
                fullfilename = './photo_uploads/' + file.name;
            }
        }
    });

    form.on('fileBegin', function (name, file) {
        console.log("Masuk upload, filename : " + file.name);
        if (file.name) {
            file.path = process.cwd() + '/public/photo_uploads/' + file.name
        }
    });
});

router.get('/likes/:id', function (req, res) {
    Product.findByIdAndUpdate(req.params.id,
        {
            $inc:
            {
                Likes: 1
            }
        },
        function (err, products) {
            if (err) {
                console.log(err);
                res.render("/");
            }
            res.redirect("/");
        });
});

module.exports = router;