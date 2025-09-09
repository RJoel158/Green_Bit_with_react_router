import React, { useState, useEffect } from "react";
import ChangePasswordModal from "../components/PasswordComp/ChangePasswordModal";

const RecicladorIndex: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      window.location.href = "/login";
      return;
    }

    const u = JSON.parse(userStr);
    u.state = Number(u.state); // asegurarse de que sea número
    setUser(u);

    if (u.state === 1) {
      console.log("✅ El modal de cambio de contraseña debería aparecer"); // <-- Aquí
      setShowModal(true);
    }
  }, []);

  if (!user) return null;

  return (
    <div>
      <h1>Bienvenido, {user.username}</h1>

      {showModal && (
        <ChangePasswordModal
          userId={user.id}
          role={user.role}
          
        />
      )}
    </div>
  );
};

export default RecicladorIndex;
