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
import UserManagement from "./components/UserManagementComponents/UserManagement";
import CollectorRequests from "./components/CollectorRequestsComponents/CollectorRequests";

import RecyclingPointsMap from "./components/CollectorMapComps/Map";

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
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/recicladorIndex" element={<RecicladorIndex />} />
        <Route path="/recolectorIndex" element={<RecolectorIndex />} />
        <Route path="/registerCollector" element={<ResgisterCollector/>} />
        <Route path="/registerInstitution" element={<RegisterInstitution/>} />
        <Route path="/userInfo" element={<UserInfo />} />
        <Route path="/recycle-form" element={<FormComp />} />
        <Route path="/adminDashboard" element={<AdminDashboard />} />
        <Route path="/recycling-points" element={<RecyclingPointsMap />} />
        <Route path="/pickupDetails/:id" element={<PickupDetails />} />
        <Route path="/adminUserManagement" element={<UserManagement />} />
        <Route path="/adminCollectorRequests" element={<CollectorRequests />} />
      </Routes>
    </Router>
  );
}

export default App;
