import { useState, useEffect } from "react";

import { Circle, DoNotDisturbOn, DarkMode } from '@mui/icons-material';
import PropTypes from 'prop-types';

import { storage } from "@root/index";
import StylingComponents from "@root/StylingComponents";

function CurrentStatus({ icon, align, height, status }) {
  if (status === "none") status = storage.get("status");

  switch (status) {
    case "0":
      return (
        <StylingComponents.CurrentStatus.StyledCurrentStatusContainer style={{ flexDirection: align === "right" ? "row-reverse" : "row", height }}>
          { icon ? <Circle style={{ color: "#f5e8da" }} fontSize="small" /> : null }
          <p className="noselect">Offline</p>
        </StylingComponents.CurrentStatus.StyledCurrentStatusContainer>
      );
    case "1":
      return (
        <StylingComponents.CurrentStatus.StyledCurrentStatusContainer style={{ flexDirection: align === "right" ? "row-reverse" : "row", height }}>
          { icon ? <Circle style={{ color: "#44b700" }} fontSize="small" /> : null }
          <p className="noselect">Online</p>
        </StylingComponents.CurrentStatus.StyledCurrentStatusContainer>
      );
    case "2":
      return (
        <StylingComponents.CurrentStatus.StyledCurrentStatusContainer style={{ flexDirection: align === "right" ? "row-reverse" : "row", height }}>
          { icon ? <DarkMode style={{ color: "#ff8800" }} fontSize="small" /> : null }
          <p className="noselect">Away</p>
        </StylingComponents.CurrentStatus.StyledCurrentStatusContainer>
      );
    case "3":
      return (
        <StylingComponents.CurrentStatus.StyledCurrentStatusContainer style={{ flexDirection: align === "right" ? "row-reverse" : "row", height }}>
          { icon ? <DoNotDisturbOn style={{ color: "#fd4949" }} fontSize="small" /> : null }
          <p className="noselect">Do not disturb</p>
        </StylingComponents.CurrentStatus.StyledCurrentStatusContainer>
      );
    case "4":
      return (
        <StylingComponents.CurrentStatus.StyledCurrentStatusContainer style={{ flexDirection: align === "right" ? "row-reverse" : "row", height }}>
          { icon ? <Circle style={{ color: "#f5e8da" }} fontSize="small" /> : null }
          <p className="noselect">Invisible</p>
        </StylingComponents.CurrentStatus.StyledCurrentStatusContainer>
      );
    default:
      return (
        <StylingComponents.CurrentStatus.StyledCurrentStatusContainer style={{ flexDirection: align === "right" ? "row-reverse" : "row", height }}>
          { icon ? <Circle style={{ color: "#f5e8da" }} /> : null }
          <p className="noselect">Unknown</p>
        </StylingComponents.CurrentStatus.StyledCurrentStatusContainer>
      );
  }
}

CurrentStatus.propTypes = {
  icon: PropTypes.bool,
  align: PropTypes.string,
  height: PropTypes.string,
  status: PropTypes.string
}

CurrentStatus.defaultProps = {
  icon: true,
  align: "right",
  height: "100%",
  status: "none"
}

export default CurrentStatus;