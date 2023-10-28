
import { Button, Container, Grid, styled } from "@mui/material"
import { useNavigate } from "react-router-dom";

import logo from "../../icon.svg";

const StyledContainerItem = styled(Container)(({ theme }) => ({
    [theme.breakpoints.up('xs')]: {
        display: "flex",
        height: "100%",
        "span": {
            color: "#fff",
            fontSize: "1.2rem",
            fontWeight: "bold",
            cursor: "pointer",
            margin: "auto 0.5rem",
            width: "100%",
            textAlign: "center",
            "&:hover": {
                color: "#e0e0e0",
            },
        }
    },
}));

function Header({ }) {
    const navigate = useNavigate();

    const changeRoute = (route) => {
        navigate(route);
    }

    return (
        <Container sx={{
            backgroundColor: "#49294d",
            maxWidth: "100% !important",
            padding: "0 !important",
            height: "5rem",
            borderBottom: "1px solid #e0e0e0",
            boxShadow: "0px 0px 10px 0px rgba(255,255,255,0.75)",
        }}>
            <Grid container sx={{}}>
                <Grid item sx={{ }}>
                    <div>
                        <img src={logo} alt="logo" style={{
                            height: "3rem",
                            width: "3rem",
                            margin: "1rem 1rem 1rem 2.2rem",
                        }} />
                    </div>
                </Grid>
                <Grid item sx={{ display: "flex" }}>
                    <StyledContainerItem item className="noselect">
                        <span onClick={() => changeRoute("/")}>
                            Home
                        </span>
                    </StyledContainerItem>
                    <StyledContainerItem item className="noselect">
                        <span onClick={() => changeRoute("/status")}>
                            Status
                        </span>
                    </StyledContainerItem>
                </Grid>
            </Grid>

        </Container>
    )
}

export default Header