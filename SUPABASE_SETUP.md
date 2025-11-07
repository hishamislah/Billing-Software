# Supabase Database Setup

## Required Tables

Run these SQL commands in your Supabase SQL Editor:

### 1. Create Customers Table

```sql
CREATE TABLE customers (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  contact TEXT NOT NULL,
  address TEXT NOT NULL,
  gstNumber TEXT DEFAULT 'N/A',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (adjust based on your needs)
CREATE POLICY "Allow all operations on customers" ON customers
  FOR ALL USING (true);
```

### 2. Create Products Table

```sql
CREATE TABLE products (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations
CREATE POLICY "Allow all operations on products" ON products
  FOR ALL USING (true);
```

### 3. Create Orders Table

```sql
CREATE TABLE orders (
  id BIGSERIAL PRIMARY KEY,
  customer_name TEXT NOT NULL,
  contact TEXT NOT NULL,
  address TEXT NOT NULL,
  gst_number TEXT DEFAULT 'N/A',
  products JSONB NOT NULL,
  status TEXT DEFAULT 'Pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations
CREATE POLICY "Allow all operations on orders" ON orders
  FOR ALL USING (true);
```

### 4. Insert Sample Data (Optional)

```sql
-- Sample Customers
INSERT INTO customers (name, contact, address, gstNumber) VALUES
  ('John Doe', '+91 9876543210', '123 Main St, City', '29ABCDE1234F1Z5'),
  ('Jane Smith', '+91 9876543211', '456 Park Ave, Town', 'N/A'),
  ('Bob Johnson', '+91 9876543212', '789 Oak Rd, Village', '27XYZAB5678G2Y4');

-- Sample Products
INSERT INTO products (name, price, description) VALUES
  ('Product A', 100.00, 'High quality product A'),
  ('Product B', 250.50, 'Premium product B'),
  ('Product C', 75.00, 'Standard product C'),
  ('Product D', 500.00, 'Deluxe product D');
```

## Environment Variables

Update your `/frontend/.env` file with your Supabase credentials:

```
REACT_APP_SUPABASE_URL=your_supabase_project_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Running the Application

1. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```

2. Start the application:
   ```bash
   npm start
   ```

The application will run on `http://localhost:3000`
