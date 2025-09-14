import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/HomeComps/Home";
import Register from "./Register";
import Login from "./Login";
import RecicladorIndex from "./components/RecyclerComp/RecyclingInterface";
import UserInfo from "./components/UserInfoComp/UserInfoInterface";



function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/recicladorIndex" element={<RecicladorIndex />} />
        <Route path="/userInfo" element={<UserInfo />} />
      </Routes>
    </Router>
  );
}

export default App;
