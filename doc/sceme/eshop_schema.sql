CREATE TABLE cart_items (
    id NUMBER(19) NOT NULL,
    quantity INTEGER,
    cart_id NUMBER(19),
    product_id NUMBER(19)
);

CREATE SEQUENCE cart_items_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

CREATE TABLE carts (
    id NUMBER(19) NOT NULL,
    user_id NUMBER(19)
);

CREATE SEQUENCE carts_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

CREATE TABLE categories (
    id NUMBER(19) NOT NULL,
    name VARCHAR2(100)
);

CREATE SEQUENCE categories_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

CREATE TABLE order_items (
    id NUMBER(19) NOT NULL,
    quantity INTEGER,
    order_id NUMBER(19),
    product_id NUMBER(19)
);

CREATE SEQUENCE order_items_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

CREATE TABLE orders (
    id NUMBER(19) NOT NULL,
    order_date TIMESTAMP(6),
    status VARCHAR2(255),
    user_id NUMBER(19),
    delivery_notes VARCHAR2(255),
    recipient_name VARCHAR2(255),
    recipient_phone VARCHAR2(255),
    shipping_address VARCHAR2(255),
    shipping_cost NUMBER(38,2),
    shipping_method VARCHAR2(255)
);

CREATE SEQUENCE orders_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

CREATE TABLE products (
    id NUMBER(19) NOT NULL,
    description VARCHAR2(1000),
    name VARCHAR2(100),
    price NUMBER(38,2) NOT NULL,
    category_id NUMBER(19)
);

CREATE SEQUENCE products_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

CREATE TABLE roles (
    id INTEGER NOT NULL,
    name VARCHAR2(20)
);

CREATE SEQUENCE roles_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

CREATE TABLE user_roles (
    user_id NUMBER(19) NOT NULL,
    role_id INTEGER NOT NULL
);

CREATE TABLE users (
    id NUMBER(19) NOT NULL,
    email VARCHAR2(100),
    password VARCHAR2(120),
    username VARCHAR2(50)
);

CREATE SEQUENCE users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER TABLE cart_items ALTER COLUMN id SET DEFAULT cart_items_id_seq.NEXTVAL;
ALTER TABLE carts ALTER COLUMN id SET DEFAULT carts_id_seq.NEXTVAL;
ALTER TABLE categories ALTER COLUMN id SET DEFAULT categories_id_seq.NEXTVAL;
ALTER TABLE order_items ALTER COLUMN id SET DEFAULT order_items_id_seq.NEXTVAL;
ALTER TABLE orders ALTER COLUMN id SET DEFAULT orders_id_seq.NEXTVAL;
ALTER TABLE products ALTER COLUMN id SET DEFAULT products_id_seq.NEXTVAL;
ALTER TABLE roles ALTER COLUMN id SET DEFAULT roles_id_seq.NEXTVAL;
ALTER TABLE users ALTER COLUMN id SET DEFAULT users_id_seq.NEXTVAL;

ALTER TABLE cart_items ADD CONSTRAINT pk_cart_items PRIMARY KEY (id);
ALTER TABLE carts ADD CONSTRAINT pk_carts PRIMARY KEY (id);
ALTER TABLE categories ADD CONSTRAINT pk_categories PRIMARY KEY (id);
ALTER TABLE order_items ADD CONSTRAINT pk_order_items PRIMARY KEY (id);
ALTER TABLE orders ADD CONSTRAINT pk_orders PRIMARY KEY (id);
ALTER TABLE products ADD CONSTRAINT pk_products PRIMARY KEY (id);
ALTER TABLE roles ADD CONSTRAINT pk_roles PRIMARY KEY (id);
ALTER TABLE user_roles ADD CONSTRAINT pk_user_roles PRIMARY KEY (user_id, role_id);
ALTER TABLE users ADD CONSTRAINT pk_users PRIMARY KEY (id);

ALTER TABLE users ADD CONSTRAINT uq_users_email UNIQUE (email);
ALTER TABLE users ADD CONSTRAINT uq_users_username UNIQUE (username);
ALTER TABLE categories ADD CONSTRAINT uq_categories_name UNIQUE (name);

ALTER TABLE cart_items ADD CONSTRAINT fk_cart_items_product FOREIGN KEY (product_id) REFERENCES products(id);
ALTER TABLE cart_items ADD CONSTRAINT fk_cart_items_cart FOREIGN KEY (cart_id) REFERENCES carts(id);
ALTER TABLE carts ADD CONSTRAINT fk_carts_user FOREIGN KEY (user_id) REFERENCES users(id);
ALTER TABLE order_items ADD CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders(id);
ALTER TABLE order_items ADD CONSTRAINT fk_order_items_product FOREIGN KEY (product_id) REFERENCES products(id);
ALTER TABLE orders ADD CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users(id);
ALTER TABLE products ADD CONSTRAINT fk_products_category FOREIGN KEY (category_id) REFERENCES categories(id);
ALTER TABLE user_roles ADD CONSTRAINT fk_user_roles_role FOREIGN KEY (role_id) REFERENCES roles(id);
ALTER TABLE user_roles ADD CONSTRAINT fk_user_roles_user FOREIGN KEY (user_id) REFERENCES users(id);
