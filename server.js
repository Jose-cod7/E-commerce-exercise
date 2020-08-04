const express = require('express');
const app = express();
const port = 4003;

const bodyParser = require("body-parser");

const { Pool } = require('pg');

const pool = new Pool({
    user: 'pepe',
    host: 'localhost',
    database: 'cyf_ecommerce',
    password: 'pepe1234',
    port: 5432
});

app.use(bodyParser.json());

app.get('/customers', (req, res) => {
    pool.query('SELECT * FROM customers', (error, result) => {
        res.json(result.rows);
    });
});

app.get('/suppliers', (req, res) => {
    pool.query('SELECT * FROM suppliers', (error, result) => {
        res.json(result.rows);
    });
});

app.get('/products', (req, res) => {
    pool.query('SELECT p.product_name, s.supplier_name FROM products p JOIN suppliers s ON (p.supplier_id = s.id)')
        .then(result => res.json(result.rows))
        .catch(error => {
            console.log(error);
            res.status(500).send('something went wrong')
        });
});

//fixed it
app.get('/products/:productName', (req, res) => {
    const nameProduct = req.params.productName;
    pool
        .query("SELECT p.product_name, s.supplier_name FROM products p INNER JOIN suppliers s ON p.supplier_id = s.id WHERE p.product_name like $1", ["%" + nameProduct + "%"])
        .then((result) => res.json(result.rows))
        .catch((e) => console.error(e));
});

app.get("/customers/:customerId", (req, res) => {
    const customerId1 = req.params.customerId;

    pool
        .query("SELECT * FROM customers  WHERE id=$1", [customerId1])
        .then((result) => {
            if (result.rowCount > 0) {
                return res.json(result.rows[0]);
            } else {
                return res.status(404).send(`Customer with id = ${customerId1} NOT FOUND`)
            }
        })
        .catch(error => {
            console.log(error);
            res.status(500).send("Something went wrong...");
        });
});

app.get("/customers/:customerId/orders", function(req, res) {
    const customerId = req.params.customerId;
    const query = `SELECT 
    customers.name,
    orders.order_reference,
    orders.order_date,
    products.product_name,
    products.unit_price,
    suppliers.supplier_name,
    suppliers.country,
    order_items.quantity
    FROM customers
    INNER JOIN orders ON customer_id = customers.id
    INNER JOIN order_items ON order_id = orders.id
    INNER JOIN products ON products.id = order_items.product_id
    INNER JOIN suppliers ON suppliers.id = products.supplier_id
    WHERE customers.id = $1`;

    pool
        .query(query, [customerId])
        .then(result => res.json(result.rows))
        .catch((e) => console.error(e));
});

// estam mal corregirlo "value as a integrer"
app.get('/customers/:customerCity', (req, res) => {
    const customerCity = req.params.customerCity;
    pool
        .query(`SELECT * FROM customers WHERE city LIKE $1`, [`%${customerCity}%`])
        .then(result => res.json(result.rows))
        .catch(error => {
            res.status(400).send('something went wrong')
        });
});

app.post("/customers", (req, res) => {
    const newCustomerName = req.body.name;
    const newCustomerAddress = req.body.address;
    const newCustomerCity = req.body.city;
    const newCustomerCountry = req.body.country;

    pool
        .query("INSERT INTO customers (name, address, city, country) VALUES ($1, $2, $3, $4)", [newCustomerName, newCustomerAddress, newCustomerCity, newCustomerCountry])
        .then(() => res.send('Customer created ecommerce!'))
        .catch((e) => console.error(e));
});

app.post('/products', (req, res) => {
    const newProductName = req.body.product_name;
    const newProductPrice = req.body.unit_price;
    const newSupplierId = req.body.supplier_id;
    //console.log('this is the value', newSupplierId);

    if (!Number.isInteger(newProductPrice) || newProductPrice <= 0) {
        return res
            .status(300)
            .send("The product price should be a positive integer");
    }

    pool
        .query("SELECT * FROM suppliers WHERE id=$1", [newSupplierId])
        .then((result) => {
            if (result.rows.length <= 0) {
                return res
                    .status(300)
                    .send("Supplier's ID doesn't exist");
            } else {
                pool
                    .query('INSERT INTO products (product_name, unit_price, supplier_id) VALUES ($1, $2, $3)', [newProductName, newProductPrice, newSupplierId])
                    .then(() => res.send('Product created!'))
                    .catch((e) => console.error(e));
            }
        });
});

//Add a new POST endpoint /customers/:customerId/orders to create a new order (including an order date, and an order reference) for a customer. Check that the customerId corresponds to an existing customer or return an error.


app.post("/customers/:customerId/orders", function(req, res) {
    console.log("hey :) !!")
    let customerId = req.params.customerId;
    let { orderDate, orderReference } = req.body;

    pool
        .query("SELECT * FROM customers c WHERE c.id = $1", [customerId])
        .then(result => {
            if (result.rowCount > 0) {
                pool.query("INSERT INTO orders (order_date, order_reference, customer_id) VALUES ($1, $2, $3)", [orderDate, orderReference, customerId])
                    .then(secondresult => res.status(201).send(`order created for customer ${customerId}`))
                    .catch(error => {
                        console.log(error);
                        res.status(500).send("could not save the order :( ...");
                    });
            } else {
                return res.status(400).send(`customer with id ${customerId} NOT FOUND`);
            }
        })
        .catch(error => {
            console.log(error);
            res.status(500).send("something went wrong :( ...");
        });
});

//Add a new PUT endpoint /customers/:customerId to update an existing customer (name, address, city and country).

app.put('/customers/:customerId', (req, res) => {
    const customerId = req.params.customerId;
    const nameUpdate = req.body.name;
    const addressUpdate = req.body.address;
    const cityUpdate = req.body.city;
    const countryUpdate = req.body.country;

    pool
        .query('UPDATE customers SET name=$1, address=$2, city=$3, country=$4 WHERE id=$5', [nameUpdate, addressUpdate, cityUpdate, countryUpdate, customerId])
        .then(() => res.send(`Customer ${customerId} updated!`))
        .catch((e) => console.error(e));
});

app.listen(port, () => {
    console.log(`Server is listening on port ${port}. Ready to accept requests from ecommerce exercise!`)
});