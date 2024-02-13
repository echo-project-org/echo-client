
import { Container, styled } from "@mui/material"

const StyledBodyContainer = styled(Container)(({ theme }) => ({
    [theme.breakpoints.up('xs')]: {
        textAlign: "center",
        color: "white",
        display: "flex",
        height: "50%",
        justifyContent: "center",
        flexDirection: "column",
        lineHeight: "3.5rem",
        "a": {
            color: "#bc5dc8",
            textDecoration: "none",
            "&:hover": {
                color: "#ea94f4",
            },
        },
    }
}))

function Home({ }) {
    return (
        <StyledBodyContainer>
            <h1>Something great is being built here!</h1>
            <p>Check back later!</p>
            <h2>Or</h2>
            <p>Help us on <a href="https://github.com/KuryGabriele/echo-project">Github</a></p>
        </StyledBodyContainer>
    )
}

export default Home