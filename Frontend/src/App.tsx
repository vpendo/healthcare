import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./Context/AuthContext";
import ProtectedRoute from "./Components/ProtectedRoute";

// Public pages
import Home from "./Pages/Home";
import About from "./Pages/about";
import Contact from "./Pages/contact";
import Login from "./Pages/login";
import Register from "./Pages/Register";
import ServicesPage from "./Pages/ServicesPage";
import FindDoctor from "./Pages/FindDoctor";
import ForgotPassword from "./Pages/ForgotPassword";
import VerifyResetCode from "./Pages/VerifyResetCode";
import ResetPassword from "./Pages/ResetPassword";

// Service detail pages
import GeneralConsultation from "./Pages/GeneralConsultation";
import DentalCare from "./Pages/DentalCare";
import OpticalCare from "./Pages/OpticalCare";

// Admin
import AdminDashboard from "./Pages/Admin/AdminDashboard";

// Patient layout and pages
import Layout from "./Components/Patients/Layout";
import Dashboard from "./Pages/Patients/userDashboard";
import BookAppointment from "./Pages/Patients/BookAppointment";
import MyAppointments from "./Pages/Patients/MyAppointments";
import AppointmentDetails from "./Pages/Patients/AppointmentDetails";
import Profile from "./Pages/Patients/Profile";
import Intake from "./Pages/Patients/Intake";

// Doctor layout and pages
import DoctorLayout from "./Components/Doctors/Layout";
import DoctorDashboard from "./Pages/Doctors/DoctorDashboard";
import DoctorProfile from "./Pages/Doctors/DoctorProfile";
import Consultations from "./Pages/Doctors/Consultations";
import MySchedule from "./Pages/Doctors/MySchedule";

// Receptionist layout and pages
import ReceptionistLayout from "./Components/Receptionist/Layout";
import ReceptionistDashboard from "./Pages/Receptionist/ReceptionistDashboard";
import TodaysQueue from "./Pages/Receptionist/TodaysQueue";
import ReceptionistAppointments from "./Pages/Receptionist/Appointments";
import PatientDetails from "./Pages/Receptionist/PatientDetails";
import ManageSlots from "./Pages/Receptionist/ManageSlots";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public pages */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/verify-reset-code" element={<VerifyResetCode />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/find-doctor" element={<FindDoctor />} />

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

          {/* Admin dashboard */}
          <Route path="/admin" element={<AdminDashboard />} />

          {/* Patient routes - Patient role only */}
          <Route element={<ProtectedRoute allowedRoles={["patient"]} />}>
            <Route path="/patients" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="intake" element={<Intake />} />
              <Route
                path="book-appointment"
                element={<BookAppointment />}
              />
              <Route path="appointments" element={<MyAppointments />} />
              <Route
                path="appointments/:appointmentId"
                element={<AppointmentDetails />}
              />
              <Route path="profile" element={<Profile />} />
            </Route>
          </Route>

          {/* Doctor routes - Doctor role only */}
          <Route element={<ProtectedRoute allowedRoles={["doctor"]} />}>
            <Route path="/doctors" element={<DoctorLayout />}>
              <Route index element={<DoctorDashboard />} />
              <Route path="profile" element={<DoctorProfile />} />
              <Route path="consultations" element={<Consultations />} />
              <Route path="schedule" element={<MySchedule />} />
            </Route>
          </Route>

          {/* Receptionist dashboard */}
          <Route path="/receptionist" element={<ReceptionistLayout />}>
            <Route index element={<ReceptionistDashboard />} />
            <Route path="queue" element={<TodaysQueue />} />
            <Route
              path="appointments"
              element={<ReceptionistAppointments />}
            />
            <Route path="patients" element={<PatientDetails />} />
            <Route path="slots" element={<ManageSlots />} />
          </Route>

          {/* Unknown routes */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}