

export default function Footer(){
  return (
    <footer className="py-4" style={{background:"#0c2b18", color:"#d6efd6"}}>
      <div className="container d-flex justify-content-between align-items-center">
        <div>
          <strong>GreenBit</strong> &nbsp; — Transformando el futuro
        </div>
        <div className="small">© {new Date().getFullYear()} GreenBit — Todos los derechos</div>
      </div>
    </footer>
  );
}
