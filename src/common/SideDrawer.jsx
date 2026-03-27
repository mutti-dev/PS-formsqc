import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Nav, Navbar, Container, Button } from "react-bootstrap";
import {
  JustifyLeft,
  JustifyRight,
  FileEarmarkText,
  FileWord,
  CodeSlash,
} from "react-bootstrap-icons";

export default function SideDrawer({ isOpen, setIsOpen, theme = 'dark', toggleTheme }) {
  const location = useLocation();

  const menuItems = [
    { path: "/JsonExtractor", name: "Form Review", icon: <FileEarmarkText /> },
    // { path: "/FormComparator", name: "Form Comparator", icon: <Files /> },
    { path: "/AdvancedJSONComparator", name: "JSON Comparator Pro", icon: <CodeSlash /> },
    { path: "/Converter", name: "Word Converter", icon: <FileWord /> },
    { path: "/TextConverter", name: "API Maker", icon: <CodeSlash /> },
  ];

  return (
    <>
      {/* Toggle Button */}
      <Button
        variant="dark"
        className="position-fixed d-flex align-items-center justify-content-center"
        style={{
          // When closed, it stays centered over the narrow bar
          left: isOpen ? "258px" : "11px", 
          top: "15px",
          zIndex: 1100,
          width: "42px",
          height: "42px",
          borderRadius: "50%",
          backgroundColor: theme === 'dark' ? "#161b22" : "#e7e9eb",
          border: theme === 'dark' ? "1px solid #30363d" : "1px solid #ccc",
          color: theme === 'dark' ? "#fff" : "#000",
          transition: "left 0.3s ease, background-color 0.3s ease",
        }}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <JustifyLeft size={20} /> : <JustifyRight size={20} />}
      </Button>

      {/* Sidebar */}
      <Navbar
        className="position-fixed vh-100"
        style={{
          width: isOpen ? "280px" : "64px",
          backgroundColor: theme === 'dark' ? "#0d1117" : "#ffffff",
          borderRight: theme === 'dark' ? "1px solid #30363d" : "1px solid #e1e4e8",
          padding: isOpen ? "1.25rem" : "0.5rem",
          transition: "width 0.3s ease",
          zIndex: 1000,
          display: "block" // Ensures flex doesn't break the width
        }}
      >
        <Container fluid className="p-0 d-flex flex-column h-100">
          {/* Header Spacer - This pushes content down so it doesn't overlap the button */}
          <div style={{ height: "60px" }} className="d-flex align-items-center">
            {isOpen && (
              <div className="w-100" style={{ color: theme === 'dark' ? '#fff' : '#000' }}>
                <h6 className="fw-bold mb-0">Form QC Tool</h6>
              </div>
            )}
          </div>
          
          {isOpen && <hr className="my-2" style={{ borderColor: theme === 'dark' ? '#30363d' : '#e1e4e8' }} />}

          {/* Navigation */}
          <Nav className="flex-column gap-2 mt-2">
            {menuItems.map((item) => {
              const active = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className="text-decoration-none"
                >
                  <div
                    className="d-flex align-items-center rounded"
                    style={{
                      padding: "10px 12px",
                      gap: isOpen ? "12px" : "0",
                      justifyContent: isOpen ? "flex-start" : "center",
                      backgroundColor: active ? "#1f6feb" : "transparent",
                      color: active ? "#fff" : theme === 'dark' ? "#8b949e" : "#656d76",
                      transition: "all 0.2s ease",
                      minHeight: "45px"
                    }}
                    onMouseEnter={(e) =>
                      !active &&
                      (e.currentTarget.style.backgroundColor = theme === 'dark' ? "#161b22" : "#f0f2f5")
                    }
                    onMouseLeave={(e) =>
                      !active &&
                      (e.currentTarget.style.backgroundColor = "transparent")
                    }
                  >
                    <span className="d-flex align-items-center fs-5">{item.icon}</span>
                    {isOpen && (
                      <span className="fw-medium text-nowrap">{item.name}</span>
                    )}
                  </div>
                </Link>
              );
            })}
          </Nav>

          {/* Spacer */}
          <div className="flex-grow-1"></div>

          {/* Theme Toggle Button */}
          <div className="pb-3">
              <button
                onClick={toggleTheme}
                style={{
                  border: theme === 'dark' ? "1px solid #30363d" : "1px solid #d1d9e0",
                  padding: "8px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  backgroundColor: theme === 'dark' ? "#161b22" : "#f6f8fa",
                  color: theme === 'dark' ? "#fff" : "#000",
                  fontWeight: "500",
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                  transition: "all 0.2s ease",
                  fontSize: "14px",
                }}
                title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              >
                <span>{theme === 'dark' ? '🌙' : '☀️'}</span>
                {isOpen && <span>{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>}
              </button>
          </div>
        </Container>
      </Navbar>
    </>
  );
}