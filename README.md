# Hostel Management System with React and Supabase

A full-stack order management application with React frontend and Supabase backend.

## Features

- Modern React login form with Supabase authentication
- Customer management system
- Order management with multiple products
- Autocomplete for customers and products
- Real-time database integration
- Dark/Light mode support

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Supabase account and project

## Setup Instructions

### 1. Supabase Setup

1. Go to [Supabase](https://supabase.com) and create a new project
2. Run the SQL commands from `SUPABASE_SETUP.md` to create tables
3. Navigate to Settings > API and copy:
   - Project URL
   - Anon/public key

### 2. Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the frontend directory:
   ```
   REACT_APP_SUPABASE_URL=your_supabase_project_url
   REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Start the React development server:
   ```bash
   npm start
   ```

The frontend will run on `http://localhost:3000`

## Usage

1. Make sure you've set up the Supabase database tables
2. Start the frontend server
3. Open your browser and navigate to `http://localhost:3000`
4. Login with your Supabase credentials
5. Navigate to:
   - **Orders**: Create and manage orders with multiple products
   - **Customers**: Add and manage customer information
   - **Dashboard**: View statistics and activity

## Features Detail

### Orders Management
- Create new orders with customer autocomplete
- Add multiple products per order
- Product autocomplete with price auto-fill
- Track order status (Pending, Processing, Shipped, Completed)

### Customer Management
- Add new customers with contact details
- Autocomplete customer selection in orders
- Auto-fill customer information when selected

### Product System
- Product database with pricing
- Autocomplete product selection
- Automatic price population

## Project Structure

```
hostel/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── LoginForm.js
│   │   │   ├── Dashboard.js
│   │   │   ├── AccountMap.js (Orders)
│   │   │   └── Customers.js
│   │   ├── supabaseClient.js
│   │   ├── App.js
│   │   └── index.js
│   ├── package.json
│   └── .env
├── SUPABASE_SETUP.md
└── README.md
```

## Notes

- Authentication uses Supabase Auth
- All data is stored in Supabase PostgreSQL database
- Customer and product autocomplete requires data in the database
- Orders support multiple products with individual pricing

## Troubleshooting

- **Authentication errors**: Verify Supabase credentials in `.env` file
- **Database errors**: Ensure all tables are created using `SUPABASE_SETUP.md`
- **Autocomplete not working**: Add customers and products to the database first
- **Orders not showing**: Check if orders table has proper RLS policies

