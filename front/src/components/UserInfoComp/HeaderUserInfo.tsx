import React from "react";
import "./UserInfo.css";
import logoText from "../../assets/logoText.svg";

const HeaderUserInfo: React.FC = () => {
  return (
    <header className="header d-flex justify-content-between align-items-center px-3 px-md-5 py-3">
      <div className="logo d-flex align-items-center">
        <img src={logoText} alt="Logo GreenBit" className="logo-img" />
      </div>
      
      <h1 className="header-title">Información de usuario</h1>
    </header>
  );
};

export default HeaderUserInfo;