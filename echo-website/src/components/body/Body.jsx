
import { Routes, Route, useLocation } from "react-router-dom";

import Home from "./Routes/Home";
import Status from "./Routes/Status";

function Body({ }) {
    const location = useLocation();
    return (
        <Routes location={location} key={location.pathname}>
            <Route path="/" exact element={<Home />} />
            <Route path="/status" element={<Status />} />
        </Routes>
    )
}

export default Body