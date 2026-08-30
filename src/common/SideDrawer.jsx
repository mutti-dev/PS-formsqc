
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Nav, Navbar, Container, Button } from "react-bootstrap";
import {
  JustifyLeft,
  JustifyRight,
  FileEarmarkText,
  FileWord,
  BarChart,
  Database,
  // Boxes,
} from "react-bootstrap-icons";

export default function SideDrawer({
  isOpen,
  setIsOpen,
  theme = "dark",
  toggleTheme,
}) {
  const location = useLocation();

  const menuItems = [
    {
      path: "/JsonExtractor",
      name: "Form Review",
      icon: <FileEarmarkText />,
    },
    // {
    //   path: "/BulkValidator",
    //   name: "Bulk Form Review",
    //   icon: <Boxes />,
    // },
    {
      path: "/AdvancedJSONComparator",
      name: "Compare Json",
      icon: <BarChart />,
    },
    {
      path: "/Converter",
      name: "Text & Word Converter",
      icon: <FileWord />,
    },
    {
      path: "/DataAnalyzer",
      name: "Data Analyzer",
      icon: <Database />,
    },
  ];

  return (
    <>
      {/* Toggle Button */}
      <Button
        variant="dark"
        className="position-fixed d-flex align-items-center justify-content-center"
        style={{
          left: isOpen ? "258px" : "19px",
          top: "15px",
          zIndex: 1100,
          width: "42px",
          height: "42px",
          borderRadius: "50%",
          backgroundColor: theme === "dark" ? "#161b22" : "#e7e9eb",
          border:
            theme === "dark"
              ? "1px solid #30363d"
              : "1px solid #ccc",
          color: theme === "dark" ? "#fff" : "#000",
          transition:
            "left 0.3s ease, background-color 0.3s ease",
        }}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? (
          <JustifyLeft size={20} />
        ) : (
          <JustifyRight size={20} />
        )}
      </Button>

      {/* Sidebar */}
      <Navbar
        className="position-fixed vh-100"
        style={{
          width: isOpen ? "280px" : "80px",
          backgroundColor:
            theme === "dark" ? "#0d1117" : "#ffffff",
          borderRight:
            theme === "dark"
              ? "1px solid #30363d"
              : "1px solid #e1e4e8",
          padding: isOpen ? "1.25rem" : "0.5rem 0.35rem",
          transition: "width 0.3s ease",
          zIndex: 1000,
          display: "block",
        }}
      >
        <Container fluid className="p-0 d-flex flex-column h-100">
          {/* Header Spacer */}
          <div
            style={{ height: "60px" }}
            className="d-flex align-items-center justify-content-center"
          >
            <div
              className="d-flex align-items-center"
              style={{
                width: "100%",
                gap: isOpen ? "12px" : "0",
                justifyContent: isOpen
                  ? "flex-start"
                  : "center",
              }}
            >
              <img
                src="/logo192.png"
                alt="App logo"
                style={{
                  width: isOpen ? "80px" : "44px",
                  height: isOpen ? "80px" : "44px",
                  borderRadius: "10px",
                  objectFit: "cover",
                  transition: "all 0.3s ease",
                }}
              />

              {isOpen && (
                <div
                  className="w-100"
                  style={{
                    color:
                      theme === "dark" ? "#fff" : "#000",
                  }}
                >
                  <h6 className="fw-bold mb-0">
                    Form QC Tool V2
                  </h6>
                </div>
              )}
            </div>
          </div>

          {isOpen && (
            <hr
              className="my-2"
              style={{
                borderColor:
                  theme === "dark"
                    ? "#30363d"
                    : "#e1e4e8",
              }}
            />
          )}

          {/* Navigation */}
          <Nav className="flex-column gap-2 mt-2">
            {menuItems.map((item) => {
              const active =
                location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className="text-decoration-none"
                  title={!isOpen ? item.name : undefined}
                >
                  <div
                    className="d-flex rounded"
                    style={{
                      flexDirection: isOpen ? "row" : "column",
                      padding: isOpen ? "10px 14px" : "8px 4px",
                      gap: isOpen ? "12px" : "4px",
                      justifyContent: isOpen ? "flex-start" : "center",
                      alignItems: "center",
                      backgroundColor: active
                        ? "#1f6feb"
                        : "transparent",
                      color: active
                        ? "#fff"
                        : theme === "dark"
                        ? "#8b949e"
                        : "#656d76",
                      transition: "all 0.2s ease",
                      minHeight: isOpen ? "45px" : "58px",
                      width: "100%",
                    }}
                    onMouseEnter={(e) =>
                      !active &&
                      (e.currentTarget.style.backgroundColor =
                        theme === "dark"
                          ? "#161b22"
                          : "#f0f2f5")
                    }
                    onMouseLeave={(e) =>
                      !active &&
                      (e.currentTarget.style.backgroundColor =
                        "transparent")
                    }
                  >
                    {/* Icon Container with fixed width for perfect vertical alignment */}
                    <span
                      className="d-flex align-items-center justify-content-center fs-5"
                      style={{
                        width: "24px",
                        minWidth: "24px",
                        height: "24px",
                        color: active
                          ? "#fff"
                          : "#0D6EFD",
                        flexShrink: 0,
                      }}
                    >
                      {item.icon}
                    </span>

                    {/* Label */}
                    <span
                      className="fw-medium"
                      style={{
                        fontSize: isOpen ? "14px" : "10px",
                        lineHeight: isOpen ? "1.4" : "1.15",
                        textAlign: isOpen ? "left" : "center",
                        whiteSpace: isOpen ? "nowrap" : "normal",
                        wordBreak: "break-word",
                        maxWidth: isOpen ? "none" : "72px",
                      }}
                    >
                      {item.name}
                    </span>
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
                border:
                  theme === "dark"
                    ? "1px solid #30363d"
                    : "1px solid #d1d9e0",
                padding: "8px",
                borderRadius: "6px",
                cursor: "pointer",
                backgroundColor:
                  theme === "dark"
                    ? "#161b22"
                    : "#f6f8fa",
                color:
                  theme === "dark" ? "#fff" : "#000",
                fontWeight: "500",
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
                transition: "all 0.2s ease",
                fontSize: "14px",
              }}
              title={
                theme === "dark"
                  ? "Light Mode"
                  : "Dark Mode"
              }
            >
              <span>
                {theme === "dark" ? "🌙" : "☀️"}
              </span>

              {isOpen && (
                <span>
                  {theme === "dark"
                    ? "Dark Mode"
                    : "Light Mode"}
                </span>
              )}
            </button>
          </div>
        </Container>
      </Navbar>
    </>
  );
}

