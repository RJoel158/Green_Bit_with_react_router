import React from 'react';
import logo from '../../assets/logo.png';

const Header: React.FC = () => {
  return (
    <header className="pickupdetail-header">
      <div className="pickupdetail-logo">
        <img src={logo} alt="Logo GreenBit" className="pickupdetail-logo-img" />
      </div>

      <h1 className="pickupdetail-header-title">
        Detalles del Recojo
      </h1>

      <div style={{ width: "120px" }}></div>
    </header>
  );
};

export default Header;