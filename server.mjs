const express = require('express');
const bodyParser = require('body-parser');
const { products, customers, reviews } = require('./data');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware for logging requests
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// Middleware for parsing request body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Set EJS as the templating engine
app.set('view engine', 'ejs');
app.use(express.static('public'));

// Custom middleware to validate product data
const validateProductData = (req, res, next) => {
    const { name, price, category } = req.body;
    if (!name || !price || !category) {
        return res.status(400).json({ error: "Name, price, and category are required." });
    }
    next();
};

// Error handling middleware
const errorHandler = (err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
};

// Routes for Products
app.get('/products', (req, res) => {
    const { category } = req.query; // Filtering by category
    const filteredProducts = category ? products.filter(product => product.category === category) : products;
    res.json(filteredProducts);
});

app.post('/products', validateProductData, (req, res) => {
    const newProduct = { id: products.length + 1, name: req.body.name, price: req.body.price, category: req.body.category };
    products.push(newProduct);
    res.status(201).json(newProduct);
});

app.patch('/products/:id', (req, res) => {
    const productId = parseInt(req.params.id);
    const product = products.find(p => p.id === productId);
    if (!product) return res.status(404).json({ error: "Product not found." });
    product.name = req.body.name || product.name;
    product.price = req.body.price || product.price;
    product.category = req.body.category || product.category;
    res.json(product);
});

app.delete('/products/:id', (req, res) => {
    const productId = parseInt(req.params.id);
    const productIndex = products.findIndex(p => p.id === productId);
    if (productIndex === -1) return res.status(404).json({ error: "Product not found." });
    products.splice(productIndex, 1);
    res.status(204).send();
});

// Routes for Customers
app.get('/customers', (req, res) => {
    res.json(customers);
});

app.post('/customers', (req, res) => {
    const newCustomer = { id: customers.length + 1, name: req.body.name, email: req.body.email };
    customers.push(newCustomer);
    res.status(201).json(newCustomer);
});

// Routes for Reviews
app.get('/reviews', (req, res) => {
    res.json(reviews);
});

app.post('/reviews', (req, res) => {
    const newReview = { id: reviews.length + 1, productId: req.body.productId, content: req.body.content };
    reviews.push(newReview);
    res.status(201).json(newReview);
});

// Render the products view
app.get('/', (req, res) => {
    res.render('index', { products });
});

// Use error handling middleware
app.use(errorHandler);

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});