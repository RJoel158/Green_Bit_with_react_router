import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Home from "./components/HomeComps/Home";
import Register from "./Auth/Register";
import Login from "./Auth/Login";
import RecicladorIndex from "./components/RecyclerComp/RecyclingInterface";
import ResgisterCollector from "./Auth/registerCollector";
import RegisterInstitution from "./Auth/registerInstitution";
import UserInfo from "./components/UserInfoComp/UserInfoInterface";
import RecolectorIndex from "./components/RecollectorComp/RecollectingInterface";
import FormComp from "./components/FormComps/FormComp";
import AdminDashboard from "./components/AdminDashboardComp/Home";
import PickupDetails from "./components/PickupDetailsComp/PickupDetails";
import NotificationsPage from "./components/CommonComp/NotificationsPage";
import UserManagement from "./components/UserManagementComp/UserManagement";
import CollectorRequests from "./components/CollectorRequestsComp/CollectorRequests";
import RecyclingPointsMap from "./components/CollectorMapComps/Map";
import ProtectedRoute from "./components/common/ProtectedRoute";

//CAMBIOS EFECTUADOS EN PANTALLAS DE INICIOO

function ScrollToTop() {
  const location = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);
  
  return null;
}

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registerCollector" element={<ResgisterCollector/>} />
        <Route path="/registerInstitution" element={<RegisterInstitution/>} />
        
        {/* Rutas protegidas - Solo Reciclador (roleId: 3) */}
        <Route 
          path="/recicladorIndex" 
          element={
            <ProtectedRoute allowedRoles={[3]}>
              <RecicladorIndex />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/recycle-form" 
          element={
            <ProtectedRoute allowedRoles={[3]}>
              <FormComp />
            </ProtectedRoute>
          } 
        />
        
        {/* Rutas protegidas - Solo Recolector (roleId: 2) */}
        <Route 
          path="/recolectorIndex" 
          element={
            <ProtectedRoute allowedRoles={[2]}>
              <RecolectorIndex />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/recycling-points" 
          element={
            <ProtectedRoute allowedRoles={[2]}>
              <RecyclingPointsMap />
            </ProtectedRoute>
          } 
        />
        
        {/* Rutas protegidas - Solo Administrador (roleId: 1) */}
        <Route 
          path="/adminDashboard" 
          element={
            <ProtectedRoute allowedRoles={[1]}>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/adminUserManagement" 
          element={
            <ProtectedRoute allowedRoles={[1]}>
              <UserManagement />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/adminCollectorRequests" 
          element={
            <ProtectedRoute allowedRoles={[1]}>
              <CollectorRequests />
            </ProtectedRoute>
          } 
        />
        
        {/* Rutas protegidas - Todos los roles autenticados (1, 2, 3) */}
        <Route 
          path="/userInfo" 
          element={
            <ProtectedRoute allowedRoles={[1, 2, 3]}>
              <UserInfo />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/pickupDetails/:id" 
          element={
            <ProtectedRoute allowedRoles={[1, 2, 3]}>
              <PickupDetails />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/notifications" 
          element={
            <ProtectedRoute allowedRoles={[1, 2, 3]}>
              <NotificationsPage />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;
