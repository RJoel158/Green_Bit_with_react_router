// CreateUserModal.tsx
import { useState } from 'react';
import { Validator } from '../../common/Validator';
import './UserManagement.css';

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserCreated: () => void;
}

type UserType = 'persona' | 'institucion';

type PersonFormData = {
  nombres: string;
  apellidos: string;
  email: string;
  phone: string;
  roleId: number;
};

type InstitutionFormData = {
  companyName: string;
  nit: string;
  email: string;
  phone: string;
  roleId: number;
};

export default function CreateUserModal({ 
  isOpen, 
  onClose,
  onUserCreated
}: CreateUserModalProps) {
  // Tipo de usuario seleccionado (persona o institución)
  const [userType, setUserType] = useState<UserType>('persona');
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState('');
  
  // Formulario de persona - valores iniciales con roleId = 2 (recolector por defecto)
  const [personForm, setPersonForm] = useState<PersonFormData>({
    nombres: '',
    apellidos: '',
    email: '',
    phone: '',
    roleId: 2,
  });
  
  // Formulario de institución - valores iniciales con roleId = 2 (recolector)
  const [institutionForm, setInstitutionForm] = useState<InstitutionFormData>({
    companyName: '',
    nit: '',
    email: '',
    phone: '',
    roleId: 2,
  });
  
  const [personErrors, setPersonErrors] = useState<Partial<PersonFormData>>({});
  const [institutionErrors, setInstitutionErrors] = useState<Partial<InstitutionFormData>>({});

  if (!isOpen) return null;

  // Maneja cambios en los campos del formulario de persona
  const handlePersonChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    // Si el campo es roleId, convertir a número, sino dejar como string
    const finalValue = name === 'roleId' ? parseInt(value) : value;
    // Actualizar el estado del formulario
    setPersonForm(prev => ({ ...prev, [name]: finalValue }));
    // Si había un error en ese campo, quitarlo
    if (personErrors[name as keyof PersonFormData]) {
      setPersonErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  // Maneja cambios en los campos del formulario de institución
  const handleInstitutionChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    // Si el campo es roleId, convertir a número, sino dejar como string
    const finalValue = name === 'roleId' ? parseInt(value) : value;
    // Actualizar el estado del formulario
    setInstitutionForm(prev => ({ ...prev, [name]: finalValue }));
    // Si había un error en ese campo, quitarlo
    if (institutionErrors[name as keyof InstitutionFormData]) {
      setInstitutionErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje('');

    if (userType === 'persona') {
      // Validar persona
      const validationErrors = {
        nombres: Validator.validatenames?.(personForm.nombres),
        apellidos: Validator.validatenames?.(personForm.apellidos),
        email: Validator.validateEmail(personForm.email),
        phone: Validator.validatePhone(personForm.phone),
      };
      setPersonErrors(validationErrors);

      if (!Validator.isValid(validationErrors)) {
        setMensaje('Por favor corrige los errores en el formulario');
        return;
      }

      setLoading(true);
      try {
        // Seleccionar endpoint según el rol:
        // roleId = 2 (Recolector): /api/users/collector -> estado 3, sin correo
        // roleId = 3 (Reciclador): /api/users -> estado 1, envía correo
        const endpoint = personForm.roleId === 2 
          ? 'http://localhost:3000/api/users/collector'
          : 'http://localhost:3000/api/users';

        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nombres: personForm.nombres,
            apellidos: personForm.apellidos,
            email: personForm.email,
            phone: personForm.phone,
            role_id: personForm.roleId,
          }),
        });

        const data = await res.json();
        if (data.success) {
          const successMessage = personForm.roleId === 2 
            ? 'Recolector registrado exitosamente. Solicitud pendiente de aprobación.'
            : 'Usuario creado exitosamente. Se envió un correo con las credenciales.';
          setMensaje(successMessage);
          setTimeout(() => {
            onUserCreated();
            handleClose();
          }, 1500);
        } else {
          setMensaje(data.error || 'Error al crear usuario');
        }
      } catch (err) {
        setMensaje('No se pudo conectar al servidor');
      } finally {
        setLoading(false);
      }
    } else {
      // Validar institución
      const validationErrors = {
        companyName: Validator.validateCompanyName(institutionForm.companyName),
        nit: Validator.validateNIT(institutionForm.nit),
        email: Validator.validateEmail(institutionForm.email),
        phone: Validator.validatePhone(institutionForm.phone),
      };
      setInstitutionErrors(validationErrors);

      if (!Validator.isValid(validationErrors)) {
        setMensaje('Por favor corrige los errores en el formulario');
        return;
      }

      setLoading(true);
      try {
        // Instituciones siempre roleId = 2 (Recolector)
        // /api/users/institution -> estado 3, sin correo hasta aprobación
        const res = await fetch('http://localhost:3000/api/users/institution', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            companyName: institutionForm.companyName,
            nit: institutionForm.nit,
            email: institutionForm.email,
            phone: institutionForm.phone,
            role_id: 2,
          }),
        });

        const data = await res.json();
        if (data.success) {
          setMensaje('Institución creada exitosamente. Solicitud pendiente de aprobación.');
          setTimeout(() => {
            onUserCreated();
            handleClose();
          }, 1500);
        } else {
          setMensaje(data.error || 'Error al crear institución');
        }
      } catch (err) {
        setMensaje('No se pudo conectar al servidor');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleClose = () => {
    setPersonForm({ nombres: '', apellidos: '', email: '', phone: '', roleId: 2 });
    setInstitutionForm({ companyName: '', nit: '', email: '', phone: '', roleId: 2 });
    setPersonErrors({});
    setInstitutionErrors({});
    setMensaje('');
    setUserType('persona');
    onClose();
  };

  return (
    <div className="modalCreateUserOverlay" onClick={handleClose}>
      <div className="modalCreateUserContainer" onClick={(e) => e.stopPropagation()}>
        <div className="modalCreateUserHeader">
          <h2 className="modalCreateUserTitle">Crear Usuario</h2>
          <button className="modalCreateUserCloseBtn" onClick={handleClose} type="button">
            ×
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="modalCreateUserContent">
            {/* Selector de tipo de usuario */}
            <div className="modalCreateUserFormGroup">
              <label htmlFor="userType" className="modalCreateUserLabel">
                Tipo de Usuario
              </label>
              <select
                id="userType"
                className="modalCreateUserSelect"
                value={userType}
                onChange={(e) => setUserType(e.target.value as UserType)}
              >
                <option value="persona">Persona</option>
                <option value="institucion">Institución</option>
              </select>
            </div>

            {/* Campos dinámicos según el tipo */}
            {userType === 'persona' ? (
              <>
                <div className="modalCreateUserFormGroup">
                  <label htmlFor="nombres" className="modalCreateUserLabel">
                    Nombres *
                  </label>
                  <input
                    id="nombres"
                    name="nombres"
                    type="text"
                    className={`modalCreateUserInput ${personErrors.nombres ? 'modalCreateUserInputError' : ''}`}
                    value={personForm.nombres}
                    onChange={handlePersonChange}
                    placeholder="Ingrese los nombres"
                  />
                  {personErrors.nombres && (
                    <span className="modalCreateUserErrorMessage">{personErrors.nombres}</span>
                  )}
                </div>

                <div className="modalCreateUserFormGroup">
                  <label htmlFor="apellidos" className="modalCreateUserLabel">
                    Apellidos *
                  </label>
                  <input
                    id="apellidos"
                    name="apellidos"
                    type="text"
                    className={`modalCreateUserInput ${personErrors.apellidos ? 'modalCreateUserInputError' : ''}`}
                    value={personForm.apellidos}
                    onChange={handlePersonChange}
                    placeholder="Ingrese los apellidos"
                  />
                  {personErrors.apellidos && (
                    <span className="modalCreateUserErrorMessage">{personErrors.apellidos}</span>
                  )}
                </div>

                <div className="modalCreateUserFormGroup">
                  <label htmlFor="email" className="modalCreateUserLabel">
                    Correo Electrónico *
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    className={`modalCreateUserInput ${personErrors.email ? 'modalCreateUserInputError' : ''}`}
                    value={personForm.email}
                    onChange={handlePersonChange}
                    placeholder="correo@ejemplo.com"
                  />
                  {personErrors.email && (
                    <span className="modalCreateUserErrorMessage">{personErrors.email}</span>
                  )}
                </div>

                <div className="modalCreateUserFormGroup">
                  <label htmlFor="phone" className="modalCreateUserLabel">
                    Teléfono *
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="text"
                    className={`modalCreateUserInput ${personErrors.phone ? 'modalCreateUserInputError' : ''}`}
                    value={personForm.phone}
                    onChange={handlePersonChange}
                    placeholder="+591XXXXXXXXX"
                  />
                  {personErrors.phone && (
                    <span className="modalCreateUserErrorMessage">{personErrors.phone}</span>
                  )}
                </div>

                <div className="modalCreateUserFormGroup">
                  <label htmlFor="roleId" className="modalCreateUserLabel">
                    Rol *
                  </label>
                  <select
                    id="roleId"
                    name="roleId"
                    className="modalCreateUserSelect"
                    value={personForm.roleId}
                    onChange={handlePersonChange}
                  >
                    <option value={2}>Recolector</option>
                    <option value={3}>Reciclador</option>
                  </select>
                </div>
              </>
            ) : (
              <>
                <div className="modalCreateUserFormGroup">
                  <label htmlFor="companyName" className="modalCreateUserLabel">
                    Razón Social *
                  </label>
                  <input
                    id="companyName"
                    name="companyName"
                    type="text"
                    className={`modalCreateUserInput ${institutionErrors.companyName ? 'modalCreateUserInputError' : ''}`}
                    value={institutionForm.companyName}
                    onChange={handleInstitutionChange}
                    placeholder="Nombre de la empresa"
                  />
                  {institutionErrors.companyName && (
                    <span className="modalCreateUserErrorMessage">{institutionErrors.companyName}</span>
                  )}
                </div>

                <div className="modalCreateUserFormGroup">
                  <label htmlFor="nit" className="modalCreateUserLabel">
                    NIT *
                  </label>
                  <input
                    id="nit"
                    name="nit"
                    type="text"
                    className={`modalCreateUserInput ${institutionErrors.nit ? 'modalCreateUserInputError' : ''}`}
                    value={institutionForm.nit}
                    onChange={handleInstitutionChange}
                    placeholder="Número de NIT"
                  />
                  {institutionErrors.nit && (
                    <span className="modalCreateUserErrorMessage">{institutionErrors.nit}</span>
                  )}
                </div>

                <div className="modalCreateUserFormGroup">
                  <label htmlFor="email-inst" className="modalCreateUserLabel">
                    Correo Electrónico *
                  </label>
                  <input
                    id="email-inst"
                    name="email"
                    type="email"
                    className={`modalCreateUserInput ${institutionErrors.email ? 'modalCreateUserInputError' : ''}`}
                    value={institutionForm.email}
                    onChange={handleInstitutionChange}
                    placeholder="correo@empresa.com"
                  />
                  {institutionErrors.email && (
                    <span className="modalCreateUserErrorMessage">{institutionErrors.email}</span>
                  )}
                </div>

                <div className="modalCreateUserFormGroup">
                  <label htmlFor="phone-inst" className="modalCreateUserLabel">
                    Teléfono *
                  </label>
                  <input
                    id="phone-inst"
                    name="phone"
                    type="text"
                    className={`modalCreateUserInput ${institutionErrors.phone ? 'modalCreateUserInputError' : ''}`}
                    value={institutionForm.phone}
                    onChange={handleInstitutionChange}
                    placeholder="+591XXXXXXXXX"
                  />
                  {institutionErrors.phone && (
                    <span className="modalCreateUserErrorMessage">{institutionErrors.phone}</span>
                  )}
                </div>

                <div className="modalCreateUserFormGroup">
                  <label htmlFor="roleId-inst" className="modalCreateUserLabel">
                    Rol
                  </label>
                  <input
                    id="roleId-inst"
                    type="text"
                    className="modalCreateUserInput modalCreateUserInputDisabled"
                    value="Recolector"
                    disabled
                    readOnly
                    title="Las instituciones solo pueden ser recolectoras"
                  />
                  
                </div>
              </>
            )}

            {mensaje && (
              <div className={`modalCreateUserAlert ${mensaje.includes('exitosamente') ? 'modalCreateUserAlertSuccess' : 'modalCreateUserAlertError'}`}>
                {mensaje}
              </div>
            )}
          </div>
          
          <div className="modalCreateUserFooter">
            <button 
              type="button" 
              className="modalCreateUserCancelBtn" 
              onClick={handleClose}
              disabled={loading}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="modalCreateUserSubmitBtn"
              disabled={loading}
            >
              {loading ? 'Creando...' : 'Crear Usuario'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
