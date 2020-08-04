select name, address from customers c where country = 'United States';
select * from customers c order by name asc;
select * from products p where unit_price > 100;
select * from products p where product_name like '%socks%';
select * from products p order by unit_price desc limit 5;

select product_name, unit_price, supplier_name from products 
join suppliers on (products.id = suppliers.id);   -- task 6.

select product_name "Product", supplier_name "Supplier", country from products
join suppliers on (products.id = suppliers.id)
where country = 'United Kingdom';   -- task 7.

select * from orders o where customer_id= 1;   -- 8
select * from customers c where name='Hope Crosby';   --9

select * from products
join suppliers on (products.id = suppliers.id)
join order_items on (products.id = order_items.id)  customers
join orders on (orders.id = order_items.id);
where order_reference = 'ORD004';   -- 10 Revisar con Martin 'ORD006' no existe. relación entre order_reference & suppliers.

select customers.name "Customer", order_reference, order_date, product_name, supplier_name "Supplier", quantity from customers
join orders on (customers.id = orders.id)
join order_items on (orders.id = order_items.id)
join products on (order_items.id = products.id)
join suppliers on (products.id = suppliers.id);  -- 11.

select customers.name, suppliers.country  from customers
join orders on (customers.id = orders.id)
join order_items on ( orders.id = order_items.id)
join products on (order_items.id = products.id )
join suppliers on (products.id = suppliers.id)
where suppliers.country = 'China';   -- 12


select * from customers c ;
select * from products p ;
select * from suppliers s ;