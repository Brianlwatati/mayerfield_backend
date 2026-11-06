-- Users Table for Authentication (using UUID)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_name VARCHAR(255) NOT NULL,
  user_role VARCHAR(40) NOT NULL DEFAULT 'customer' CHECK (user_role IN ('user','admin', 'customer', 'staff', 'manager')),
  user_email VARCHAR(255) UNIQUE NOT NULL,
  user_password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Categories Table (New)
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Menu Items Table (using UUID)
CREATE TABLE IF NOT EXISTS menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  category VARCHAR(100) NOT NULL,
  image TEXT,
  is_popular BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  stripe_session_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL,
  item_id UUID NOT NULL,
  quantity INT NOT NULL,
  price_at_purchase DECIMAL(10, 2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (item_id) REFERENCES menu_items(id)
);

-- Seed Initial Menu Items without duplicating them when the migration is rerun.
INSERT INTO menu_items (name, description, price, category, image, is_popular)
SELECT seed.name, seed.description, seed.price, seed.category, seed.image, seed.is_popular
FROM (VALUES
  ('Classic Espresso', 'Rich and bold double shot extracted from our signature roasted beans.', 3.50, 'Hot Coffee', 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?auto=format&fit=crop&q=80&w=600', TRUE),
  ('Caramel Macchiato', 'Freshly steamed milk with vanilla-flavored syrup, marked with espresso and caramel drip.', 4.85, 'Hot Coffee', 'https://images.unsplash.com/photo-1485808191679-5f86510681a2?auto=format&fit=crop&q=80&w=600', TRUE),
  ('Iced Cold Brew', 'Slow-steeped for 20 hours for an ultra-smooth, naturally sweet flavor over ice.', 4.50, 'Cold Drinks', 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&q=80&w=600', FALSE),
  ('Iced Matcha Latte', 'Ceremonial grade Japanese matcha whisked with oat milk and served over ice.', 5.25, 'Cold Drinks', 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&q=80&w=600', FALSE),
  ('Butter Croissant', 'Flaky, buttery multi-layered pastry baked fresh every morning.', 3.75, 'Bakery', 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&q=80&w=600', TRUE),
  ('Blueberry Muffin', 'Moist muffin packed with wild organic blueberries and topped with streusel.', 3.95, 'Bakery', 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?auto=format&fit=crop&q=80&w=600', FALSE),
  ('Chai Tea Latte', 'Black tea infused with cinnamon, clove, and sweet aromatic spices with steamed milk.', 4.25, 'Tea & Others', 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&q=80&w=600', FALSE),
  ('Iced Peach Hibiscus Tea', 'Refreshing herbal tea shaken with sweet peach puree and ice.', 4.00, 'Tea & Others', 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&q=80&w=600', FALSE)
) AS seed(name, description, price, category, image, is_popular)
WHERE NOT EXISTS (
  SELECT 1
  FROM menu_items existing
  WHERE existing.name = seed.name AND existing.category = seed.category
);