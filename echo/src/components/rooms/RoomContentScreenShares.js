import React from 'react'
import { useState, useEffect } from 'react'
import { Container, styled } from '@mui/material'


const StyledContainer = styled(Container)(({ theme }) => ({
    [theme.breakpoints.up('xs')]: {
        margin: "0 0 0 1rem",
        height: "calc(100vh - 2rem)",
        width: "100%",
        position: "relative",
        padding: "0",
        display: "inline-flex",
        flexDirection: "column",
        justifyContent: "space-between",
        maxWidth: "calc(100vw - 20rem)"
    },
    [theme.breakpoints.up('lg')]: {
        margin: "0 0 0 1rem",
        height: "calc(100vh - 2rem)",
        width: "100%",
        position: "relative",
        padding: "0",
        display: "inline-flex",
        flexDirection: "column",
        justifyContent: "space-between",
        maxWidth: "calc(100vw - 20rem)"
    },
    [theme.breakpoints.up('xl')]: {
        margin: "0 0 0 1rem",
        height: "calc(100vh - 2rem)",
        width: "100%",
        position: "relative",
        padding: "0",
        display: "inline-flex",
        flexDirection: "column",
        justifyContent: "space-between",
        maxWidth: "calc(100vw - 20rem)"
    },
}));

function RoomContentScreenShares({ roomId }) {

    return (
        <StyledContainer>
            <video id="screenShareBox" autoPlay></video>
        </StyledContainer>
    )
}

export default RoomContentScreenShares