import { Routes, Route, Navigate } from "react-router-dom";
import { AppProvider } from "./context/AppContext.jsx";
import DashboardPage      from "./pages/DashboardPage.jsx";
import PatientPage        from "./pages/PatientPage.jsx";
import RegisterPage       from "./pages/RegisterPage.jsx";

export default function App() {
  return (
    <AppProvider>
      <Routes>
        <Route path="/"               element={<DashboardPage />} />
        <Route path="/register"       element={<RegisterPage />} />
        <Route path="/patient/:id"    element={<PatientPage />} />
        <Route path="*"               element={<Navigate to="/" replace />} />
      </Routes>
    </AppProvider>
  );  
}
