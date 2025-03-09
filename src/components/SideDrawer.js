import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function SideDrawer() {
  const [isOpen, setIsOpen] = useState(true);
  const toggleDrawer = () => setIsOpen(!isOpen);

  return (
    <>
      <div style={{ 
        ...styles.drawer, 
        transform: isOpen ? 'translateX(0)' : 'translateX(-100%)' 
      }}>
        <div style={styles.header}>
          <h1 style={styles.title}>
            <span style={styles.logo}>🚀</span>
            Planstreet
          </h1>
          <div style={styles.divider} />
        </div>
        <nav>
          <ul style={styles.list}>
            <li style={styles.item}>
              <Link 
                to="/extractor" 
                style={styles.link}
                activeStyle={styles.activeLink}
              >
                <span style={styles.icon}>📑</span>
                <span style={styles.linkText}>JSON Extractor</span>
              </Link>
            </li>
            <li style={styles.item}>
              <Link 
                to="/comparator" 
                style={styles.link}
                activeStyle={styles.activeLink}
              >
                <span style={styles.icon}>⚖️</span>
                <span style={styles.linkText}>JSON Comparator</span>
              </Link>
            </li>
          </ul>
        </nav>
      </div>
      <button 
        onClick={toggleDrawer} 
        style={{
          ...styles.toggleButton,
          left: isOpen ? '280px' : '20px'
        }}
      >
        <div style={styles.hamburger(isOpen)}>
          <span style={styles.hamburgerLine}></span>
          <span style={styles.hamburgerLine}></span>
          <span style={styles.hamburgerLine}></span>
        </div>
      </button>
    </>
  );
}

const styles = {
  drawer: {
    width: '280px',
    backgroundColor: '#ffffff',
    padding: '2rem 1.5rem',
    height: '100vh',
    boxSizing: 'border-box',
    position: 'fixed',
    top: 0,
    left: 0,
    boxShadow: '8px 0 30px rgba(0, 0, 0, 0.05)',
    borderRight: '1px solid #f0f0f0',
    transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    zIndex: 1000,
  },
  header: {
    marginBottom: '2rem',
    paddingLeft: '0.5rem',
  },
  title: {
    margin: '0 0 1.5rem 0',
    color: '#1a1a1a',
    fontSize: '1.6rem',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  logo: {
    fontSize: '1.8rem',
    marginRight: '8px',
  },
  divider: {
    height: '1px',
    backgroundColor: '#eeeeee',
    margin: '0 -1.5rem',
  },
  list: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  item: {
    marginBottom: '8px',
    position: 'relative',
  },
  link: {
    textDecoration: 'none',
    color: '#4a5568',
    fontSize: '1rem',
    fontWeight: '500',
    padding: '14px 20px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    transition: 'all 0.2s ease',
    ':hover': {
      backgroundColor: '#f8faff',
      transform: 'translateX(6px)',
    },
  },
  activeLink: {
    backgroundColor: '#f0f6ff',
    color: '#3b82f6',
    fontWeight: '600',
    ':before': {
      content: '""',
      position: 'absolute',
      left: 0,
      top: '50%',
      transform: 'translateY(-50%)',
      height: '70%',
      width: '4px',
      backgroundColor: '#3b82f6',
      borderRadius: '0 4px 4px 0',
    },
  },
  icon: {
    marginRight: '16px',
    fontSize: '1.4rem',
    width: '28px',
    textAlign: 'center',
    color: '#64748b',
  },
  linkText: {
    position: 'relative',
    top: '1px',
  },
  toggleButton: {
    position: 'fixed',
    top: '24px',
    padding: '12px',
    borderRadius: '12px',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    backgroundColor: '#ffffff',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    zIndex: 1001,
    ':hover': {
      backgroundColor: '#f8f9fa',
      transform: 'scale(1.05)',
    },
  },
  hamburger: (isOpen) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
    width: '24px',
    transform: isOpen ? 'rotate(180deg)' : 'none',
    transition: 'transform 0.3s ease',
  }),
  hamburgerLine: {
    height: '2px',
    width: '24px',
    backgroundColor: '#1a1a1a',
    borderRadius: '2px',
    transition: 'transform 0.3s ease',
    ':nth-child(1)': {
      transform: 'rotate(45deg) translate(5px, 5px)',
    },
    ':nth-child(2)': {
      opacity: 0,
    },
    ':nth-child(3)': {
      transform: 'rotate(-45deg) translate(5px, -5px)',
    },
  },
};