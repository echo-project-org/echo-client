import "../../css/userstatus.css";

import { Container } from '@mui/material'
import { Circle, DoNotDisturbOn, DarkMode } from '@mui/icons-material';
import PropTypes from 'prop-types';

import { storage } from "../../index";

function CurrentStatus({ icon, align, height }) {
  const online = storage.get("online");

  var style={
    width: "100%",
    height,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexDirection: align === "right" ? "row-reverse" : "row",
    alignContent: "center",
    padding: "0.5rem",
    fontSize: "0.9rem",
  }

  switch (online) {
    case "0":
      return (
        <Container style={style}>
          { icon ? <Circle style={{ color: "#f5e8da" }} fontSize="small" /> : null }
          <p>Offline</p>
        </Container>
      );
    case "1":
      return (
        <Container style={style}>
          { icon ? <Circle style={{ color: "#44b700" }} fontSize="small" /> : null }
          <p>Online</p>
        </Container>
      );
    case "2":
      return (
        <Container style={style}>
          { icon ? <DarkMode style={{ color: "#ff8800" }} fontSize="small" /> : null }
          <p>Away</p>
        </Container>
      );
    case "3":
      return (
        <Container style={style}>
          { icon ? <DoNotDisturbOn style={{ color: "#fd4949" }} fontSize="small" /> : null }
          <p>Do not disturb</p>
        </Container>
      );
    case "4":
      return (
        <Container style={style}>
          { icon ? <Circle style={{ color: "#f5e8da" }} fontSize="small" /> : null }
          <p>Invisible</p>
        </Container>
      );
    default:
      return (
        <Container style={style}>
          <Circle style={{ color: "#f5e8da" }} />
          <p>Offline</p>
        </Container>
      );
  }
}

CurrentStatus.propTypes = {
  icon: PropTypes.bool,
  align: PropTypes.string,
  height: PropTypes.string
}

CurrentStatus.defaultProps = {
  icon: true,
  align: "right",
  height: "100%"
}

export default CurrentStatus;