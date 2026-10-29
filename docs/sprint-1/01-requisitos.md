# Requisitos y alcance

## Actores

- **Administrador de empresa:** configura la empresa, gestiona integrantes y consulta toda la información contable.
- **Contador:** administra cuentas, registra pólizas y genera reportes de la empresa asignada.
- **Consultor:** consulta saldos y reportes sin modificar datos.

## Requisitos funcionales

| ID | Requisito | Prioridad | Verificación esperada |
| --- | --- | --- | --- |
| RF-01 | El sistema debe autenticar a cada usuario antes de permitir acceso a información contable. | Alta | Un visitante no puede consultar recursos protegidos. |
| RF-02 | El sistema debe limitar cada operación a las empresas y permisos asociados con el usuario. | Alta | Un usuario no puede consultar ni modificar datos de otra empresa. |
| RF-03 | El administrador o contador debe poder crear, consultar, actualizar y desactivar cuentas contables. | Alta | El catálogo refleja los cambios válidos sin borrar historial. |
| RF-04 | El contador debe poder registrar una póliza con una o más líneas de cargo y abono. | Alta | La póliza sólo se publica si la suma del debe coincide con la suma del haber. |
| RF-05 | El usuario autorizado debe poder consultar movimientos y saldos por cuenta y periodo. | Alta | La consulta muestra saldo inicial, movimientos y saldo final. |
| RF-06 | El sistema debe generar el balance general de un periodo con activos, pasivos y capital. | Alta | Se muestran subtotales y la comprobación Activo = Pasivo + Capital. |
| RF-07 | El sistema debe generar el estado de resultados con ingresos, gastos y utilidad o pérdida. | Alta | La utilidad corresponde a ingresos menos gastos del periodo. |
| RF-08 | El sistema debe mostrar la evolución mensual, variación porcentual y promedio histórico de los resultados. | Media | La interfaz presenta valores y gráfica para el intervalo seleccionado. |
| RF-09 | El usuario autorizado debe poder exportar los estados financieros a PDF. | Media | El archivo contiene empresa, periodo, fecha de generación y cifras mostradas. |
| RF-10 | El administrador debe poder invitar, desactivar y asignar roles a integrantes de su empresa. | Media | Los permisos cambian sin afectar a otras empresas. |
| RF-11 | El sistema debe conservar un registro auditable de accesos y acciones contables sensibles. | Alta | Se identifica actor, acción, recurso y fecha sin guardar secretos. |

## Reglas de negocio

| ID | Regla |
| --- | --- |
| RN-01 | Toda cuenta pertenece a una empresa y tiene código único dentro de ella. |
| RN-02 | Una cuenta se clasifica como activo, pasivo, capital, ingreso o gasto; puede tener un subtipo. |
| RN-03 | Los importes monetarios se almacenan con precisión decimal; no se usan valores de punto flotante binario. |
| RN-04 | Una póliza publicada debe tener al menos dos líneas, importes positivos y total debe igual a total haber. |
| RN-05 | Una póliza publicada no se elimina ni edita directamente; se corrige mediante cancelación o póliza de ajuste. |
| RN-06 | Las cuentas con movimientos se desactivan, no se eliminan. |
| RN-07 | Todos los cálculos de reportes se filtran por empresa y periodo contable. |
| RN-08 | La utilidad o pérdida se calcula como ingresos menos gastos del periodo. |
| RN-09 | El balance general debe indicar si la ecuación contable está cuadrada. |
| RN-10 | Las fechas se almacenan de forma normalizada y se presentan en la zona horaria configurada para la empresa. |

## Requisitos no funcionales

| ID | Requisito | Criterio medible para el MVP |
| --- | --- | --- |
| RNF-01 | La interfaz debe funcionar en navegadores modernos de escritorio y móvil. | Flujos principales utilizables desde 360 px de ancho y versiones actuales de Chrome, Edge y Firefox. |
| RNF-02 | La interfaz debe ser comprensible y responsiva. | Navegación por teclado, etiquetas de formulario y mensajes de error asociados al campo. |
| RNF-03 | Las respuestas de consulta comunes deben ser oportunas. | El percentil 95 de la API es menor a 1 segundo con el volumen de prueba acordado. |
| RNF-04 | Los datos deben persistir en una base relacional. | Reiniciar el servidor no elimina cuentas, pólizas ni integrantes. |
| RNF-05 | El proyecto debe separar rutas, controladores, servicios, acceso a datos, validadores y middlewares. | La revisión de estructura no encuentra lógica de negocio en rutas ni SQL en controladores. |
| RNF-06 | La aplicación debe aplicar defensa en profundidad. | Validación de servidor, autenticación, autorización, aislamiento por empresa, secretos externos y auditoría. |
| RNF-07 | Los errores deben ser seguros y trazables. | El cliente recibe un mensaje controlado y un identificador; el servidor registra el detalle sin datos sensibles. |
| RNF-08 | El desarrollo debe ser reproducible. | Instrucciones y variables de entorno de ejemplo permiten configurar el proyecto sin publicar secretos. |

## Supuestos y límites

- El producto es una aplicación web; esto está establecido tanto en la rúbrica como en la propuesta.
- La propuesta fija Node.js, Express, HTML, CSS y JavaScript.
- La propuesta original consideraba MySQL o PostgreSQL. El equipo decidió posteriormente utilizar MySQL porque ya lo tiene disponible y posee experiencia previa con este motor.
- La primera versión se orienta a una empresa por membresía, pero un usuario puede pertenecer a más de una empresa.
- El prototipo C++ se usa como referencia conceptual para cuentas, debe, haber, saldos y balance; su archivo de texto no se adopta como persistencia web.
