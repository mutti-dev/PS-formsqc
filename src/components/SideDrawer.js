import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";

export default function SideDrawer({ isOpen, setIsOpen }) {
  const toggleDrawer = () => setIsOpen(!isOpen);
  const location = useLocation();

  return (
    <>
      <button
        onClick={toggleDrawer}
        style={{
          ...styles.toggleButton,
          left: isOpen ? "260px" : "40px", // hugs drawer edge
          top: "20px", // keep a small margin from top
        }}
        aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
      >
        <div style={styles.hamburger(isOpen)}>
          <span style={styles.hamburgerLine}></span>
          <span style={styles.hamburgerLine}></span>
          <span style={styles.hamburgerLine}></span>
        </div>
      </button>
      <div
        style={{
          ...styles.drawer(isOpen),
          transform: isOpen ? "translateX(0)" : "translateX(0)",
        }}
      >
        <div style={styles.header(isOpen)}>
          {isOpen && (
            <>
              <h1 style={styles.title}>
                <span style={styles.logo}>🚀</span>
                Planstreet
              </h1>
              <div style={styles.divider} />
            </>
          )}
        </div>
        <nav>
          <ul style={styles.list}>
            <li style={styles.item}>
              <Link
                to="/extractor"
                style={{
                  ...styles.link(isOpen),
                  ...(location.pathname === "/extractor"
                    ? styles.activeLink
                    : {}),
                }}
              >
                <span style={styles.icon}>{"📑"}</span>
                {isOpen && <span style={styles.linkText}>JSON Extractor</span>}
              </Link>
            </li>
            <li style={styles.item}>
              <Link
                to="/form"
                style={{
                  ...styles.link(isOpen),
                  ...(location.pathname === "/form" ? styles.activeLink : {}),
                }}
              >
                <span style={styles.icon}>{"⚖️"}</span>
                {isOpen && <span style={styles.linkText}>Form Comparator</span>}
              </Link>
            </li>
            <li style={styles.item}>
              <Link
                to="/converter"
                style={{
                  ...styles.link(isOpen),
                  ...(location.pathname === "/converter"
                    ? styles.activeLink
                    : {}),
                }}
              >
                <span style={styles.icon}>{"🔤"}</span>
                {isOpen && <span style={styles.linkText}>Word Converter</span>}
              </Link>
            </li>
            <li style={styles.item}>
              <Link
                to="/jsonformatter"
                style={{
                  ...styles.link(isOpen),
                  ...(location.pathname === "/jsonformatter"
                    ? styles.activeLink
                    : {}),
                }}
              >
                <span style={styles.icon}>{"🔤"}</span>
                {isOpen && <span style={styles.linkText}>JSON Formatter</span>}
              </Link>
            </li>
            <li style={styles.item}>
              <Link
                to="/textconverter"
                style={{
                  ...styles.link(isOpen),
                  ...(location.pathname === "/textconverter"
                    ? styles.activeLink
                    : {}),
                }}
              >
                <span style={styles.icon}>{"🔤"}</span>
                {isOpen && <span style={styles.linkText}>API Maker</span>}
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </>
  );
}

const styles = {
  drawer: (isOpen) => ({
    width: isOpen ? "280px" : "60px",
    backgroundColor: "#ffffff",
    padding: isOpen ? "2rem 1.5rem" : "1rem 0.5rem",
    height: "100vh",
    boxSizing: "border-box",
    position: "fixed",
    top: 0,
    left: 0,
    boxShadow: "8px 0 30px rgba(0, 0, 0, 0.05)",
    borderRight: "1px solid #f0f0f0",
    transition:
      "width 0.3s cubic-bezier(0.4, 0, 0.2, 1), padding 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    zIndex: 1000,
    overflow: "hidden",
  }),
  header: (isOpen) => ({
    marginBottom: isOpen ? "2rem" : "0.5rem",
    paddingLeft: isOpen ? "0.5rem" : 0,
    minHeight: isOpen ? "auto" : "32px",
  }),
  title: {
    margin: "0 0 1.5rem 0",
    color: "#1a1a1a",
    fontSize: "1.6rem",
    fontWeight: "700",
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  logo: {
    fontSize: "1.8rem",
    marginRight: "8px",
  },
  divider: {
    height: "1px",
    backgroundColor: "#eeeeee",
    margin: "0 -1.5rem",
  },
  list: {
    listStyle: "none",
    padding: 0,
    margin: 0,
  },
  item: {
    marginBottom: "8px",
    position: "relative",
  },
  link: (isOpen) => ({
    textDecoration: "none",
    color: "#4a5568",
    fontSize: "1rem",
    fontWeight: "500",
    padding: isOpen ? "14px 20px" : "14px 10px",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: isOpen ? "flex-start" : "center",
    transition: "all 0.2s ease",
    minWidth: 0,
    whiteSpace: "nowrap",
    overflow: "hidden",
  }),
  activeLink: {
    backgroundColor: "#f0f6ff",
    color: "#3b82f6",
    fontWeight: "600",
  },
  icon: {
    marginRight: "0px",
    fontSize: "1.4rem",
    width: "28px",
    textAlign: "center",
    color: "#64748b",
    display: "inline-block",
  },
  linkText: {
    position: "relative",
    top: "1px",
    marginLeft: "16px",
  },
  toggleButton: {
    position: "fixed",
    // instead of top: "24px"
    top: "20px",
    // left is set dynamically above
    padding: "10px",
    borderRadius: "50%",
    border: "none",
    cursor: "pointer",
    transition: "all 0.3s ease",
    backgroundColor: "#ffffff",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
    zIndex: 1001,
  },
  hamburger: (isOpen) => ({
    display: "flex",
    flexDirection: "column",
    gap: "5px",
    width: "20px",
    transform: isOpen ? "rotate(180deg)" : "none",
    transition: "transform 0.3s ease",
    alignItems: "center",
    justifyContent: "center",
  }),
  hamburgerLine: {
    height: "2px",
    width: "20px",
    backgroundColor: "#1a1a1a",
    borderRadius: "2px",
    transition: "transform 0.3s ease",
  },
};
