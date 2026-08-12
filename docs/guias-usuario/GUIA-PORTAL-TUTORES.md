# 🛡️ GUÍA DE USUARIO - PORTAL DE SEGUIMIENTO PARA TUTORES

## 🎯 PROPÓSITO DEL PORTAL
El **Portal de Seguimiento para Tutores y Referentes Legales** de la Defensoría de la Niñez y Adolescencia (DNA) permite a los tutores legales, padres o representantes acreditados consultar el **estado en tiempo real de los expedientes** y la **programación de citas o audiencias**, garantizando la transparencia del proceso sin exponer información confidencial ni datos sensibles del NNA.

---

## 🔑 ACCESO AL PORTAL

### 1. **Obtención de Credenciales de Acceso**
Las credenciales son entregadas presencialmente por el personal de **Secretaría** o **Jefatura** de la Defensoría al momento de la apertura del caso o durante la atención:
- **Código de Expediente**: Formato único del caso (ej. `CASO-2026-0042` o `DNA-2026-X`).
- **PIN de Seguridad**: Código numérico privado de 6 dígitos asignado al tutor/referente legal.

### 2. **Ingreso al Sistema (`/portal/login`)**
1. Accede a la dirección web del portal: `http://localhost:3100/portal/login` (o la URL oficial provista por la institución).
2. Ingresa el **Código de Expediente** en el primer campo.
3. Ingresa tu **PIN de Seguridad** de 6 dígitos.
4. Haz clic en **"Ingresar al Expediente"**.

![Captura de pantalla: Login Portal de Tutores](/docs/images/placeholders/portal-login.png)

---

## 📊 CONSULTA DE ESTADO DEL CASO (`/portal/estado`)

Una vez autenticado/a, accederás al panel de control del expediente:

### 1. **Fase Actual del Caso**
El portal muestra una línea de progreso clara con la fase en la que se encuentra la intervención:
- 🔵 **DERIVACIÓN**: Caso ingresado y en proceso de asignación a equipo interdisciplinario.
- 🟡 **EVALUACIÓN**: Equipo legal, psicológico y social realizando informes iniciales y Ficha Social.
- 🟠 **SEGUIMIENTO**: Plan de acción en ejecución (sesiones terapéuticas, visitas domiciliarias, citaciones).
- 🟣 **CONCILIACIÓN / VÍA JUDICIAL**: Audiencias de conciliación en curso o proceso derivado a juzgados.
- 🟢 **CIERRE**: Caso resuelto y archivado formalmente.

![Captura de pantalla: Estado del Caso en Portal](/docs/images/placeholders/portal-estado.png)

### 2. **Próximas Citas y Audiencias**
En la sección **"Próximas Citas y Audiencias Agendadas"**, el tutor podrá consultar:
- **Fecha y Hora**: Cuándo debe apersonarse a la oficina.
- **Tipo de Cita**: Evaluación psicológica, entrevista social, audiencia de conciliación o seguimiento.
- **Lugar / Oficina**: Sala o consultorio asignado.

### 3. **Seguridad y Privacidad Garantizada**
Para proteger los derechos del niño, niña o adolescente:
- No se muestran los contenidos de las entrevistas psicológicas ni la evidencia confidencial.
- El acceso está restringido únicamente al estado administrativo, fechas de citaciones y confirmación de recepción de informes.

---

## 🚪 CERRAR SESIÓN
Por seguridad, especialmente al ingresar desde teléfonos compartidos o cabinas públicas:
- Haz clic en el botón **"Cerrar Sesión"** ubicado en la esquina superior derecha del portal antes de salir.
