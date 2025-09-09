// models/userModel.js
import { query } from "../DBConnect.js";

export const getAll = () =>
  query(
    "SELECT u.id, u.username, u.email, u.phone, r.name AS role, u.state FROM users u JOIN roles r ON u.role_id = r.id WHERE u.state = 0"
  );

export const getById = (id) =>
  query(
    "SELECT u.id, u.username, u.email, u.phone, u.password, r.name AS role, u.state FROM users u JOIN roles r ON u.role_id = r.id WHERE u.id = ? AND u.state = 0",
    [id]
  );
//Cambiar la logica del state
 export const loginUser = (email) =>
  query(
    "SELECT u.id, u.username, u.email, u.phone, u.password, r.name AS role, u.state FROM users u JOIN role r ON u.role_id = r.id WHERE u.email = ? AND u.state != 0",
    [email]
  );


export const create = (username,password, email, phone, role_id) =>
  query(
    "INSERT INTO users (username,password, email, phone, role_id) VALUES (?, ? ,?, ?, ?)",
    [username,password, email, phone, role_id]
  );

export const update = (id, username, email, phone, role_id, state) =>
  query(
    "UPDATE users SET username = ?, email = ?, phone = ?, role_id = ?, state = ? WHERE id = ?",
    [username, email, phone, role_id, state, id]
  );

export const softDelete = (id) =>
  query("UPDATE users SET state = 1 WHERE id = ?", [id]);
