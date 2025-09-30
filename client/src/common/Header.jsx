import React from 'react';
import { Link } from 'react-router-dom';

function Header() {
  return (
    <div style={{
      backgroundColor: '#f0f0f0',
      padding: '10px 20px',
      borderBottom: '1px solid #ccc',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <nav style={{
        display: 'flex',
        gap: '20px'
      }}>
        <Link to="/">Home</Link>
        <Link to="/signup">Signup</Link>
        <Link to="/signout">Signout</Link>
      </nav>
    </div>
  );
}

export default Header;