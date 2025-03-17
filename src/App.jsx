import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register.jsx";

import Profile from "./pages/Profile.jsx";
import MealPlan from "./pages/MealPlan.jsx";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/MealPlan" element={<MealPlan />} />
            </Routes>
        </Router>
    );
}

export default App;




