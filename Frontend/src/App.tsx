import { BrowserRouter, Routes, Route } from "react-router-dom";

// Public pages
import Home from "./Pages/Home";
import About from "./Pages/about";
import Contact from "./Pages/contact";
import Login from "./Pages/login";
import Register from "./Pages/Register";
import ServicesPage from "./Pages/ServicesPage";
import FindDoctor from "./Pages/FindDoctor";

// Service detail pages
import GeneralConsultation from "./Pages/GeneralConsultation";
import DentalCare from "./Pages/DentalCare";
import OpticalCare from "./Pages/OpticalCare";

// Patient layout
import Layout from "./Components/Patients/Layout";

// Patient pages
import Dashboard from "./Pages/Patients/userDashboard";
import BookAppointment from "./Pages/Patients/BookAppointment";
import MyAppointments from "./Pages/Patients/MyAppointments";
import AppointmentDetails from "./Pages/Patients/AppointmentDetails";
import Profile from "./Pages/Patients/Profile";
import Intake from "./Pages/Patients/Intake";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public pages */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/doctors" element={<FindDoctor />} />

        {/* Services */}
        <Route path="/services" element={<ServicesPage />} />
        <Route
          path="/services/general-consultation"
          element={<GeneralConsultation />}
        />
        <Route
          path="/services/dental-care"
          element={<DentalCare />}
        />
        <Route
          path="/services/optical-care"
          element={<OpticalCare />}
        />

        {/* Patient dashboard */}
        <Route path="/patients" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="intake" element={<Intake />} />
          <Route
            path="book-appointment"
            element={<BookAppointment />}
          />
          <Route
            path="appointments"
            element={<MyAppointments />}
          />
          <Route
            path="appointments/:appointmentId"
            element={<AppointmentDetails />}
          />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}