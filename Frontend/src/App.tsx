
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./Pages/Home";
import About from "./Pages/about";
//import Services from "./Pages/Services";
import Contact from "./Pages/contact";
import Login from "./Pages/login";
import Register from "./Pages/Register";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact/>}/>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register/>}/>
        
      </Routes>
    </BrowserRouter>
  );
}
