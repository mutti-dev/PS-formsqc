import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Nav, Navbar, Container, Button } from "react-bootstrap";
import {
  JustifyLeft,
  JustifyRight,
  FileEarmarkText,
  Files,
  FileWord,
  Braces,
  CodeSlash,
} from "react-bootstrap-icons";

export default function SideDrawer({ isOpen, setIsOpen }) {
  const location = useLocation();

  const menuItems = [
    { path: "/extractor", name: "Form Review", icon: <FileEarmarkText /> },
    { path: "/jsonformatter", name: "JSON Formatter", icon: <Braces /> },
    { path: "/form", name: "Form Comparator", icon: <Files /> },
    { path: "/converter", name: "Word Converter", icon: <FileWord /> },
    { path: "/textconverter", name: "API Maker", icon: <CodeSlash /> },
  ];

  return (
    <>
      {/* Toggle Button */}
      <Button
        variant="dark"
        className="position-fixed d-flex align-items-center justify-content-center"
        style={{
          left: isOpen ? "260px" : "20px",
          top: "20px",
          zIndex: 1100,
          width: "42px",
          height: "42px",
          borderRadius: "50%",
          backgroundColor: "#161b22",
          border: "1px solid #30363d",
        }}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <JustifyLeft /> : <JustifyRight />}
      </Button>

      {/* Sidebar */}
      <Navbar
        className="position-fixed vh-100"
        style={{
          width: isOpen ? "280px" : "64px",
          backgroundColor: "#0d1117",
          borderRight: "1px solid #30363d",
          padding: isOpen ? "1.25rem" : "1rem 0.5rem",
          transition: "width 0.3s ease",
          zIndex: 1000,
        }}
      >
        <Container fluid className="p-0 d-flex flex-column">
          {/* Header */}
          {isOpen && (
            <div className="mb-2 text-light">
              <h6 className="fw-bold mb-1">Form QC Tool</h6>
              <hr className="my-2 border-secondary" />
            </div>
          )}

          {/* Navigation */}
          <Nav className="flex-column gap-1">
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
                      color: active ? "#fff" : "#8b949e",
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) =>
                      !active &&
                      (e.currentTarget.style.backgroundColor = "#161b22")
                    }
                    onMouseLeave={(e) =>
                      !active &&
                      (e.currentTarget.style.backgroundColor = "transparent")
                    }
                  >
                    <span className="fs-5">{item.icon}</span>
                    {isOpen && (
                      <span className="fw-medium">{item.name}</span>
                    )}
                  </div>
                </Link>
              );
            })}
          </Nav>
        </Container>
      </Navbar>
    </>
  );
}
