import React from "react";
import "./UserInfo.css";
import logo from "../../assets/logo.png";

const HeaderUserInfo: React.FC = () => {
  return (
    <header className="header d-flex align-items-center justify-content-between px-3 px-md-5">
     
      <div className="logo d-flex align-items-center flex-shrink-0">
        <img src={logo} alt="Logo GreenBit" className="logo-img img-fluid" />
      </div>

     
      <h1 className="header-title text-center flex-grow-1 fw-bold">
        Información de usuario
      </h1>

     
      <div style={{ width: "120px" }}></div>
    </header>
  );
};

export default HeaderUserInfo;
