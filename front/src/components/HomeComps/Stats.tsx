import React from "react";

const Stat = ({num, label}:{num:string,label:string}) => (
  <div className="text-center text-white">
    <div className="display-4 fw-bold">{num}</div>
    <div className="small text-white-50">{label}</div>
  </div>
);

export default function Stats(){
  return (
    <section className="py-5" style={{background:"var(--verde-2)"}}>
      <div className="container text-center">
        <h3 className="text-white landing-title mb-5">Nuestro Impacto en Números</h3>
        <div className="row g-4">
          <div className="col-6 col-md-3"><Stat num="15,000+" label="Toneladas Recicladas" /></div>
          <div className="col-6 col-md-3"><Stat num="200+" label="Empresas Aliadas" /></div>
          <div className="col-6 col-md-3"><Stat num="50,000+" label="Personas Capacitadas" /></div>
          <div className="col-6 col-md-3"><Stat num="12" label="Años de experiencia" /></div>
        </div>
      </div>
    </section>
  );
}
