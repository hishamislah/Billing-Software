import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import BillGenerationDialog from './BillGenerationDialog';
import './AccountMap.css';

const AccountMap = () => {
  const [showNewOrderForm, setShowNewOrderForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [expandedOrders, setExpandedOrders] = useState([]);
  const [orderComments, setOrderComments] = useState({});
  const [editingOrder, setEditingOrder] = useState(null);
  const [billDialogOrder, setBillDialogOrder] = useState(null);
  const [orderForm, setOrderForm] = useState({
    customerName: '',
    contact: '',
    address: '',
    gstNumber: 'N/A',
    products: [{ productName: '', quantity: '', price: '' }]
  });

  const [ordersData, setOrdersData] = useState([]);

  useEffect(() => {
    fetchCustomers();
    fetchProducts();
    fetchOrders();
  }, []);

  const fetchCustomers = async () => {
    const { data, error } = await supabase
      .from('customers')
      .select('*');
    if (!error && data) {
      setCustomers(data);
    }
  };

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*');
    if (!error && data) {
      setProducts(data);
    }
  };

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) {
      setOrdersData(data);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setOrderForm({
      ...orderForm,
      [name]: value
    });

    if (name === 'customerName') {
      const filtered = customers.filter(c => 
        c.name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredCustomers(filtered);
      setShowCustomerDropdown(value.length > 0 && filtered.length > 0);
    }
  };

  const handleProductChange = (index, field, value) => {
    const newProducts = [...orderForm.products];
    newProducts[index][field] = value;
    setOrderForm({ ...orderForm, products: newProducts });

    if (field === 'productName') {
      const filtered = products.filter(p => 
        p.name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredProducts({ ...filteredProducts, [index]: filtered });
    }
  };

  const selectCustomer = (customer) => {
    setOrderForm({
      ...orderForm,
      customerName: customer.name,
      contact: customer.contact,
      address: customer.address,
      gstNumber: customer.gstNumber
    });
    setShowCustomerDropdown(false);
  };

  const selectProduct = (index, product) => {
    const newProducts = [...orderForm.products];
    newProducts[index] = {
      productName: product.name,
      quantity: newProducts[index].quantity,
      price: product.price
    };
    setOrderForm({ ...orderForm, products: newProducts });
    setFilteredProducts({ ...filteredProducts, [index]: [] });
  };

  const addProductRow = () => {
    setOrderForm({
      ...orderForm,
      products: [...orderForm.products, { productName: '', quantity: '', price: '' }]
    });
  };

  const removeProductRow = (index) => {
    const newProducts = orderForm.products.filter((_, i) => i !== index);
    setOrderForm({ ...orderForm, products: newProducts });
  };

  const toggleOrderExpand = (orderId) => {
    setExpandedOrders(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const handleCommentChange = async (orderId, comment) => {
    setOrderComments({ ...orderComments, [orderId]: comment });
    
    await supabase
      .from('orders')
      .update({ comments: comment })
      .eq('id', orderId);
  };

  const openBillDialog = (order) => {
    setBillDialogOrder(order);
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    
    const { error } = await supabase
      .from('orders')
      .insert([{
        customer_name: orderForm.customerName,
        contact: orderForm.contact,
        address: orderForm.address,
        gst_number: orderForm.gstNumber,
        products: orderForm.products,
        status: 'Pending',
        comments: ''
      }]);
    
    if (!error) {
      fetchOrders();
      setShowNewOrderForm(false);
      setOrderForm({
        customerName: '',
        contact: '',
        address: '',
        gstNumber: 'N/A',
        products: [{ productName: '', quantity: '', price: '' }]
      });
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);
    
    fetchOrders();
  };

  const startEditOrder = (order) => {
    setEditingOrder(order.id);
    setOrderForm({
      customerName: order.customer_name,
      contact: order.contact,
      address: order.address,
      gstNumber: order.gst_number,
      products: order.products || [{ productName: '', quantity: '', price: '' }]
    });
    setShowNewOrderForm(true);
  };

  const handleUpdateOrder = async (e) => {
    e.preventDefault();
    
    const { error } = await supabase
      .from('orders')
      .update({
        customer_name: orderForm.customerName,
        contact: orderForm.contact,
        address: orderForm.address,
        gst_number: orderForm.gstNumber,
        products: orderForm.products
      })
      .eq('id', editingOrder);
    
    if (!error) {
      fetchOrders();
      setShowNewOrderForm(false);
      setEditingOrder(null);
      setOrderForm({
        customerName: '',
        contact: '',
        address: '',
        gstNumber: 'N/A',
        products: [{ productName: '', quantity: '', price: '' }]
      });
    }
  };

  const cancelEdit = () => {
    setShowNewOrderForm(false);
    setEditingOrder(null);
    setOrderForm({
      customerName: '',
      contact: '',
      address: '',
      gstNumber: 'N/A',
      products: [{ productName: '', quantity: '', price: '' }]
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return '#28a745';
      case 'Processing': return '#ffc107';
      case 'Shipped': return '#17a2b8';
      case 'Pending': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const paginatedData = ordersData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const totalPages = Math.ceil(ordersData.length / rowsPerPage);

  return (
    <>
      {billDialogOrder && (
        <BillGenerationDialog
          order={billDialogOrder}
          onClose={() => setBillDialogOrder(null)}
          onBillGenerated={fetchOrders}
        />
      )}
      
    <div className="account-map-container">
      <div className="account-map-header">
        <div className="header-content">
          <h1>Orders</h1>
          <p className="header-subtitle">Manage your orders with Trade Bazar's comprehensive tracking system.</p>
        </div>
        <div className="header-actions">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input type="text" placeholder="Search orders" />
          </div>
          <button className="toggle-view-btn" aria-label="Toggle view">☰</button>
          <button className="add-account-btn" onClick={() => setShowNewOrderForm(true)}>
            <span className="plus-icon">+</span>
            New Order
          </button>
        </div>
      </div>

      {showNewOrderForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingOrder ? 'Edit Order' : 'New Order'}</h2>
              <button className="close-btn" onClick={cancelEdit}>×</button>
            </div>
            <form onSubmit={editingOrder ? handleUpdateOrder : handleSubmitOrder} className="order-form">
              <div className="form-group autocomplete-wrapper">
                <label>Customer Name:</label>
                <input
                  type="text"
                  name="customerName"
                  value={orderForm.customerName}
                  onChange={handleInputChange}
                  autoComplete="off"
                  required
                />
                {showCustomerDropdown && (
                  <div className="autocomplete-dropdown">
                    {filteredCustomers.map(customer => (
                      <div
                        key={customer.id}
                        className="autocomplete-item"
                        onClick={() => selectCustomer(customer)}
                      >
                        <strong>{customer.name}</strong>
                        <small>{customer.contact}</small>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="form-group">
                <label>Contact:</label>
                <input
                  type="text"
                  name="contact"
                  value={orderForm.contact}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Address:</label>
                <textarea
                  name="address"
                  value={orderForm.address}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>GST Number:</label>
                <input
                  type="text"
                  name="gstNumber"
                  value={orderForm.gstNumber}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="products-section">
                <div className="products-header">
                  <label>Products:</label>
                  <button type="button" onClick={addProductRow} className="add-product-btn">
                    + Add Product
                  </button>
                </div>
                
                {orderForm.products.map((product, index) => (
                  <div key={index} className="product-row">
                    <div className="form-group autocomplete-wrapper">
                      <label>Product Name:</label>
                      <input
                        type="text"
                        value={product.productName}
                        onChange={(e) => handleProductChange(index, 'productName', e.target.value)}
                        autoComplete="off"
                        required
                      />
                      {filteredProducts[index] && filteredProducts[index].length > 0 && (
                        <div className="autocomplete-dropdown">
                          {filteredProducts[index].map(p => (
                            <div
                              key={p.id}
                              className="autocomplete-item"
                              onClick={() => selectProduct(index, p)}
                            >
                              <strong>{p.name}</strong>
                              <small>₹{p.price}</small>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="product-details">
                      <div className="form-group">
                        <label>Quantity:</label>
                        <input
                          type="number"
                          value={product.quantity}
                          onChange={(e) => handleProductChange(index, 'quantity', e.target.value)}
                          required
                          min="1"
                        />
                      </div>
                      <div className="form-group">
                        <label>Price:</label>
                        <input
                          type="number"
                          value={product.price}
                          onChange={(e) => handleProductChange(index, 'price', e.target.value)}
                          required
                          min="0"
                          step="0.01"
                        />
                      </div>
                      {orderForm.products.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeProductRow(index)}
                          className="remove-product-btn"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="form-actions">
                <button type="button" onClick={cancelEdit} className="cancel-btn">
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  {editingOrder ? 'Update Order' : 'Create Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="account-table-wrapper">
        <table className="account-table">
          <thead>
            <tr>
              <th className="sortable">
                ORDER ID
                <span className="sort-icon">⇅</span>
              </th>
              <th className="sortable">
                CUSTOMER
                <span className="sort-icon">⇅</span>
              </th>
              <th className="sortable">
                PRODUCT
                <span className="sort-icon">⇅</span>
              </th>
              <th className="sortable">
                QUANTITY
                <span className="sort-icon">⇅</span>
              </th>
              <th className="sortable">
                STATUS
                <span className="sort-icon">⇅</span>
              </th>
              <th className="sortable">
                DATE
                <span className="sort-icon">⇅</span>
              </th>
              <th>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map(order => {
              const isExpanded = expandedOrders.includes(order.id);
              const total = order.products?.reduce((sum, p) => 
                sum + (parseFloat(p.price || 0) * parseInt(p.quantity || 0)), 0
              ) || 0;
              
              return (
                <React.Fragment key={order.id}>
                  <tr className="account-row" onClick={() => toggleOrderExpand(order.id)}>
                    <td className="code-cell">
                      <div className="expand-wrapper">
                        <button className="expand-btn">
                          {isExpanded ? '▼' : '▶'}
                        </button>
                        ORD{order.id}
                      </div>
                    </td>
                    <td className="account-cell">{order.customer_name}</td>
                    <td className="category-cell">
                      {order.products && order.products.length > 0 
                        ? order.products.map(p => p.productName).join(', ')
                        : 'N/A'}
                    </td>
                    <td className="balance-cell">
                      {order.products && order.products.length > 0
                        ? order.products.reduce((sum, p) => sum + parseInt(p.quantity || 0), 0)
                        : 0}
                    </td>
                    <td className="status-cell">
                      <span 
                        className="status-badge" 
                        style={{ backgroundColor: getStatusColor(order.status) }}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="date-cell">{new Date(order.created_at).toLocaleDateString()}</td>
                    <td className="action-cell">
                      <div className="action-buttons">
                        <button 
                          className="action-btn edit-btn" 
                          onClick={(e) => { e.stopPropagation(); startEditOrder(order); }}
                          title="Edit Order"
                        >
                          ✏️
                        </button>
                        <button 
                          className="action-btn bill-btn-icon" 
                          onClick={(e) => { e.stopPropagation(); openBillDialog(order); }}
                          title="Generate Bill"
                        >
                          📝
                        </button>
                      </div>
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr className="order-details-row">
                      <td colSpan="7">
                        <div className="order-details">
                          <div className="details-section">
                            <h4>Customer Details</h4>
                            <div className="details-grid">
                              <div className="detail-item">
                                <strong>Name:</strong> {order.customer_name}
                              </div>
                              <div className="detail-item">
                                <strong>Contact:</strong> {order.contact}
                              </div>
                              <div className="detail-item">
                                <strong>Address:</strong> {order.address}
                              </div>
                              <div className="detail-item">
                                <strong>GST Number:</strong> {order.gst_number}
                              </div>
                            </div>
                          </div>
                          
                          <div className="details-section">
                            <h4>Products</h4>
                            <table className="products-table">
                              <thead>
                                <tr>
                                  <th>Product</th>
                                  <th>Quantity</th>
                                  <th>Price</th>
                                  <th>Total</th>
                                </tr>
                              </thead>
                              <tbody>
                                {order.products?.map((product, idx) => (
                                  <tr key={idx}>
                                    <td>{product.productName}</td>
                                    <td>{product.quantity}</td>
                                    <td>₹{parseFloat(product.price).toFixed(2)}</td>
                                    <td>₹{(parseFloat(product.price) * parseInt(product.quantity)).toFixed(2)}</td>
                                  </tr>
                                ))}
                              </tbody>
                              <tfoot>
                                <tr>
                                  <td colSpan="3"><strong>Grand Total</strong></td>
                                  <td><strong>₹{total.toFixed(2)}</strong></td>
                                </tr>
                              </tfoot>
                            </table>
                          </div>
                          
                          <div className="details-section">
                            <h4>Status & Comments</h4>
                            <div className="status-actions">
                              <label>Update Status:</label>
                              <select 
                                value={order.status} 
                                onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <option value="Pending">Pending</option>
                                <option value="Processing">Processing</option>
                                <option value="Shipped">Shipped</option>
                                <option value="Completed">Completed</option>
                                <option value="Cancelled">Cancelled</option>
                              </select>
                            </div>
                            <div className="comments-section">
                              <label>Comments:</label>
                              <textarea
                                value={orderComments[order.id] ?? order.comments ?? ''}
                                onChange={(e) => handleCommentChange(order.id, e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                placeholder="Add comments about this order..."
                              />
                            </div>
                          </div>
                          
                          <div className="details-actions">
                            <button className="bill-btn" onClick={(e) => { e.stopPropagation(); openBillDialog(order); }}>
                              📝 Generate Bill
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="table-footer">
        <div className="rows-per-page">
          <span>Show per page</span>
          <select 
            value={rowsPerPage} 
            onChange={(e) => {
              setRowsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="20">20</option>
          </select>
        </div>
        <div className="pagination">
          <button 
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            aria-label="Previous page"
          >
            ‹
          </button>
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i + 1}
              onClick={() => setCurrentPage(i + 1)}
              className={currentPage === i + 1 ? 'active' : ''}
            >
              {i + 1}
            </button>
          ))}
          {totalPages > 3 && <span className="ellipsis">...</span>}
          <button 
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            aria-label="Next page"
          >
            ›
          </button>
        </div>
      </div>
    </div>
    </>
  );
};

export default AccountMap;
