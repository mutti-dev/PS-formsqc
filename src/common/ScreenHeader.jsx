import React from "react";
import PropTypes from "prop-types";
import { Badge } from "react-bootstrap";
import "./ScreenHeader.css";

/**
 * Modern unified screen header component with glowing blue icon badge.
 */
export default function ScreenHeader({
  icon,
  title,
  subtitle,
  badge,
  badgeVariant = "primary",
  actions,
  className = "",
  children,
}) {
  return (
    <div className={`screen-header-card ${className}`}>
      <div className="screen-header-left">
        {icon && <div className="screen-header-icon-badge">{icon}</div>}
        <div className="screen-header-title-wrapper">
          <h1 className="screen-header-title">
            {title}
            {badge && (
              <Badge bg={badgeVariant} className="fs-6 fw-semibold align-middle">
                {badge}
              </Badge>
            )}
          </h1>
          {children}
        </div>
      </div>

      {actions && <div className="screen-header-actions">{actions}</div>}
    </div>
  );
}

ScreenHeader.propTypes = {
  icon: PropTypes.node,
  title: PropTypes.node.isRequired,
  subtitle: PropTypes.node,
  badge: PropTypes.node,
  badgeVariant: PropTypes.string,
  actions: PropTypes.node,
  className: PropTypes.string,
  children: PropTypes.node,
};
