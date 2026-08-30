import React, { useState, useEffect } from "react";
import { ArrowUpShort } from "react-bootstrap-icons";
import "./BackToTop.css";

export default function BackToTop({ threshold = 250 }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop;
      setIsVisible(scrollY > threshold);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Initial check

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [threshold]);

  const scrollToTop = () => {
    if (typeof window !== "undefined" && typeof window.scrollTo === "function") {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
    if (
      document.documentElement &&
      typeof document.documentElement.scrollTo === "function"
    ) {
      document.documentElement.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  return (
    <button
      type="button"
      className={`back-to-top-btn ${isVisible ? "visible" : ""}`}
      onClick={scrollToTop}
      title="Back to Top"
      aria-label="Back to top"
    >
      <ArrowUpShort size={28} />
    </button>
  );
}
