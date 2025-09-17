import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/HomeComps/Home";
import Register from "./Auth/Register";
import Login from "./Auth/Login";
import RecicladorIndex from "./components/RecyclerComp/RecyclingInterface";
import ResgisterCollector from "./Auth/registerCollector";
import RegisterInstitution from "./Auth/registerInstitution";
import UserInfo from "./components/UserInfoComp/UserInfoInterface";



function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/recicladorIndex" element={<RecicladorIndex />} />
        <Route path="/registerCollector" element={<ResgisterCollector/>} />
        <Route path="/registerInstitution" element={<RegisterInstitution/>} />
        <Route path="/userInfo" element={<UserInfo />} />
      </Routes>
    </Router>
  );
}

export default App;
