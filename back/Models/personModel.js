// Models/personModel.js
// Funciones sobre la tabla person. Todas reciben `conn` (conexión) para participar en transacciones.

export const create = async (conn, firstname, lastname, birthdate = null, users_id = null) => {
  if (users_id !== null) {
    const [res] = await conn.query(
      "INSERT INTO person (firstname, lastname, birthdate, users_id) VALUES (?, ?, ?, ?)",
      [firstname, lastname, birthdate, users_id]
    );
    return res.insertId;
  } else {
    const [res] = await conn.query(
      "INSERT INTO person (firstname, lastname, birthdate) VALUES (?, ?, ?)",
      [firstname, lastname, birthdate]
    );
    return res.insertId;
  }
};

export const update = async (conn, id, firstname, lastname, birthdate = null) => {
  const [res] = await conn.query(
    "UPDATE person SET firstname = ?, lastname = ?, birthdate = ? WHERE id = ?",
    [firstname, lastname, birthdate, id]
  );
  return res.affectedRows > 0;
};

export const softDelete = async (conn, id) => {
  const [cols] = await conn.query("SHOW COLUMNS FROM person LIKE 'deleted_at'");
  if (cols.length === 0) return false;
  const [res] = await conn.query("UPDATE person SET deleted_at = NOW() WHERE id = ?", [id]);
  return res.affectedRows > 0;
};
