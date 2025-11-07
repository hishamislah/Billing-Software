import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import './Customers.css';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [customerForm, setCustomerForm] = useState({
    name: '',
    contact: '',
    address: '',
    gstNumber: 'N/A'
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!error && data) {
      setCustomers(data);
    }
  };

  const handleInputChange = (e) => {
    setCustomerForm({
      ...customerForm,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const { error } = await supabase
      .from('customers')
      .insert([customerForm]);
    
    if (!error) {
      fetchCustomers();
      setShowAddForm(false);
      setCustomerForm({
        name: '',
        contact: '',
        address: '',
        gstNumber: 'N/A'
      });
    }
  };

  return (
    <div className="customers-container">
      <div className="customers-header">
        <div className="header-content">
          <h1>Customers</h1>
          <p className="header-subtitle">Manage your customer database</p>
        </div>
        <button className="add-btn" onClick={() => setShowAddForm(true)}>
          <span className="plus-icon">+</span>
          Add Customer
        </button>
      </div>

      {showAddForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Add New Customer</h2>
              <button className="close-btn" onClick={() => setShowAddForm(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit} className="customer-form">
              <div className="form-group">
                <label>Customer Name:</label>
                <input
                  type="text"
                  name="name"
                  value={customerForm.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Contact:</label>
                <input
                  type="text"
                  name="contact"
                  value={customerForm.contact}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Address:</label>
                <textarea
                  name="address"
                  value={customerForm.address}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>GST Number:</label>
                <input
                  type="text"
                  name="gstNumber"
                  value={customerForm.gstNumber}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-actions">
                <button type="button" onClick={() => setShowAddForm(false)} className="cancel-btn">
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  Add Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="customers-grid">
        {customers.map(customer => (
          <div key={customer.id} className="customer-card">
            <h3>{customer.name}</h3>
            <p><strong>Contact:</strong> {customer.contact}</p>
            <p><strong>Address:</strong> {customer.address}</p>
            <p><strong>GST:</strong> {customer.gstNumber}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Customers;
