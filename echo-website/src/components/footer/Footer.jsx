import { Container } from "@mui/material"

function Footer({ }) {
    return (
        <Container sx={{
            position: "fixed",
            backgroundColor: "#49294d",
            maxWidth: "100% !important",
            padding: "0 !important",
            height: "1.8rem",
            boxShadow: "0px 0px 5px 0px rgba(255,255,255,0.4)",
            bottom: "0",
        }}>
            
        </Container>
    )
}

export default Footer