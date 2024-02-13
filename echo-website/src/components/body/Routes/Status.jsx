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

function Status({ }) {
    return (
        <StyledBodyContainer>
            <h1>Nothing to see here!</h1>
            <p>For now...</p>
        </StyledBodyContainer>
    )
}

export default Status