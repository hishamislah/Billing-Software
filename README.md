# Trade Bazar Billing Software with React and Supabase

A full-stack billing and invoice management application with React frontend and Supabase backend.

## Features

- Modern React login form with Supabase authentication
- Customer management system
- Order management with multiple products
- Invoice generation with PDF export (TB-001, TB-002, etc.)
- Tax invoice with GST calculation (B2B/B2C)
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
   - **Orders**: Create and manage orders with multiple products and generate invoices
   - **Customers**: Add and manage customer information with GST details
   - **Dashboard**: View statistics and activity

## Features Detail

### Invoice Generation
- Generate tax invoices with sequential numbering (TB-001, TB-002, etc.)
- Support for B2B invoices (with 18% GST: 9% CGST + 9% SGST)
- Support for B2C invoices (without GST)
- PDF export with proper A4 formatting
- Payment details included in invoice
- Amount in words conversion

### Orders Management
- Create new orders with customer autocomplete
- Add multiple products per order
- Product autocomplete with price auto-fill
- Track order status (Pending, Processing, Shipped, Completed)
- Generate bills directly from orders

### Customer Management
- Add new customers with contact details and GST numbers
- Support for both B2B (with GST) and B2C (without GST) customers
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
│   │   │   ├── Customers.js
│   │   │   ├── BillGenerationDialog.js
│   │   │   └── TaxInvoice.js
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
- Invoice numbers are auto-generated sequentially (TB-001, TB-002, etc.)
- PDF generation uses html2canvas and jsPDF libraries
- Invoices include company details for Trade Bazar

## Troubleshooting

- **Authentication errors**: Verify Supabase credentials in `.env` file
- **Database errors**: Ensure all tables are created using `SUPABASE_SETUP.md`, including `invoices` table
- **Autocomplete not working**: Add customers and products to the database first
- **Orders not showing**: Check if orders table has proper RLS policies
- **PDF not generating**: Ensure html2canvas and jspdf packages are installed
- **Invoice numbers not incrementing**: Check invoices table for existing invoice numbers

