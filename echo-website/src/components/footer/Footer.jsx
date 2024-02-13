import { Container, Typography, styled } from "@mui/material"
import { Favorite } from '@mui/icons-material';

const StyledFooterTypography = styled(Typography)(({ theme }) => ({
    [theme.breakpoints.up('xs')]: {
        margin: "auto 0 auto 0",
        color: "white",
        display: "flex",
        padding: "0 0 0 1rem",
        "a": {
            color: "#bc5dc8",
            padding: "0 .5rem 0 .5rem",
            textDecoration: "none",
            "&:hover": {
                color: "#ea94f4",
            },
        },
    }
}))

function Footer({ }) {
    const openNewPage = (username) => {
        window.open(`https://github.com/${username}`, "_blank");
    }

    return (
        <Container sx={{
            position: "fixed",
            backgroundColor: "#49294d",
            maxWidth: "100% !important",
            padding: "0 !important",
            height: "1.8rem",
            boxShadow: "0px 0px 5px 0px rgba(255,255,255,0.4)",
            bottom: "0",
            display: "flex",
        }}>
            <StyledFooterTypography>
                Made with <Favorite sx={{ margin: "0rem .5rem 0 .5rem", color: "red" }} /> by <a onClick={() => openNewPage("zthundy")} href="#">zThundy</a> & <a onClick={() => openNewPage("kurygabriele")} href="#">Kury</a>
            </StyledFooterTypography>
            
        </Container>
    )
}

export default Footer