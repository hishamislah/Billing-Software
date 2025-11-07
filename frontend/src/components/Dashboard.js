import React, { useState, useEffect } from 'react';
import './Dashboard.css';
import AccountMap from './AccountMap';
import Customers from './Customers';

const Dashboard = ({ onLogout }) => {
  const [user, setUser] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [activeSection, setActiveSection] = useState('account-map');
  const [sidebarExpanded] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    onLogout();
  };

  const menuItems = [
    {
      id: 'dashboard',
      icon: '📊',
      label: 'Dashboard',
      children: [
        { id: 'activity', label: 'Activity' },
        { id: 'traffic', label: 'Traffic' },
        { id: 'statistic', label: 'Statistic' }
      ]
    },
    { id: 'account-map', icon: '🗺️', label: 'Orders' },
    { id: 'invoices', icon: '📄', label: 'Invoices' },
    { id: 'customers', icon: '👥', label: 'Customers' },
    { id: 'notification', icon: '🔔', label: 'Notification' }
  ];

  return (
    <div className={`dashboard-container ${darkMode ? 'dark' : ''}`}>
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarExpanded ? 'expanded' : 'collapsed'}`}>
        <div className="sidebar-header">
          {sidebarExpanded && (
            <div className="brand-logo">
              <h2>Vazhemadom</h2>
            </div>
          )}
          <div className="user-info">
            <div className="user-avatar">
              <img src="https://ui-avatars.com/api/?name=Admin&background=000&color=fff" alt="User" />
            </div>
            {sidebarExpanded && (
              <div className="user-details">
                <span className="user-role">ADMINISTRATOR</span>
                <h3 className="user-name">Admin</h3>
              </div>
            )}
          </div>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map(item => (
            <div key={item.id} className="nav-item-wrapper">
              <button
                className={`nav-item ${activeSection === item.id ? 'active' : ''}`}
                onClick={() => setActiveSection(item.id)}
              >
                <span className="nav-icon">{item.icon}</span>
                {sidebarExpanded && <span className="nav-label">{item.label}</span>}
                {item.children && sidebarExpanded && (
                  <span className="nav-arrow">▶</span>
                )}
              </button>
              {item.children && sidebarExpanded && activeSection === item.id && (
                <div className="nav-children">
                  {item.children.map(child => (
                    <button
                      key={child.id}
                      className="nav-child-item"
                      onClick={() => setActiveSection(child.id)}
                    >
                      {child.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button 
            className="sidebar-action-btn"
            onClick={() => setDarkMode(!darkMode)}
          >
            <span>{darkMode ? '☀️' : '🌙'}</span>
            {sidebarExpanded && <span>{darkMode ? 'Dark mode' : 'Light mode'}</span>}
          </button>
          
          <button 
            className="sidebar-action-btn logout"
            onClick={handleLogout}
          >
            <span>🚪</span>
            {sidebarExpanded && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="dashboard-main">
        {activeSection === 'account-map' && <AccountMap />}
        {activeSection === 'customers' && <Customers />}
        
        {activeSection === 'dashboard' && (
          <div className="content-wrapper">
            <div className="welcome-section">
              <h2>Welcome to Vazhemadom</h2>
              <p>{user?.email}</p>
            </div>

            <div className="stats-grid">
              <div className="stat-card">
                <h3>Total Users</h3>
                <p className="stat-value">1,234</p>
              </div>
              <div className="stat-card">
                <h3>Active Sessions</h3>
                <p className="stat-value">89</p>
              </div>
              <div className="stat-card">
                <h3>Revenue</h3>
                <p className="stat-value">$12.5K</p>
              </div>
              <div className="stat-card">
                <h3>Growth</h3>
                <p className="stat-value">+23%</p>
              </div>
            </div>

            <div className="content-section">
              <h3>Recent Activity</h3>
              <div className="activity-list">
                <div className="activity-item">
                  <span className="activity-dot"></span>
                  <div>
                    <p className="activity-title">New user registered</p>
                    <p className="activity-time">2 minutes ago</p>
                  </div>
                </div>
                <div className="activity-item">
                  <span className="activity-dot"></span>
                  <div>
                    <p className="activity-title">System update completed</p>
                    <p className="activity-time">1 hour ago</p>
                  </div>
                </div>
                <div className="activity-item">
                  <span className="activity-dot"></span>
                  <div>
                    <p className="activity-title">Database backup successful</p>
                    <p className="activity-time">3 hours ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection !== 'account-map' && activeSection !== 'dashboard' && (
          <div className="content-wrapper">
            <div className="placeholder-content">
              <h2>{menuItems.find(item => item.id === activeSection)?.label}</h2>
              <p>This section is coming soon...</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
