# Plan de seguridad

## Objetivos

- Proteger credenciales, sesiones e información financiera.
- Impedir acceso horizontal entre empresas y elevación de privilegios.
- Validar toda entrada en el servidor.
- Mantener secretos fuera del código y del repositorio.
- Producir evidencia reproducible de controles y pruebas.

## Roles y permisos

| Operación | ADMIN | ACCOUNTANT | VIEWER |
| --- | :---: | :---: | :---: |
| Administrar integrantes y roles | Sí | No | No |
| Crear y modificar catálogo | Sí | Sí | No |
| Registrar pólizas | Sí | Sí | No |
| Consultar movimientos y reportes | Sí | Sí | Sí |
| Exportar reportes | Sí | Sí | Sí |

La autorización verifica simultáneamente identidad, membresía activa, empresa del recurso y rol. Recibir un identificador válido nunca es suficiente para autorizar.

## Validaciones previstas

| Entrada | Validación de servidor |
| --- | --- |
| Correo | Normalización, longitud máxima y formato válido. |
| Contraseña | Longitud mínima, máximo razonable y comparación mediante hash resistente; nunca se registra. |
| Identificadores | UUID válido y pertenencia a la empresa activa. |
| Código de cuenta | Caracteres permitidos, longitud, unicidad por empresa y tipo permitido. |
| Importes | Decimal finito, positivo, escala monetaria y límite máximo documentado. |
| Póliza | Dos o más líneas, una columna por línea, cuentas activas y suma debe igual a suma haber. |
| Fechas y periodos | Formato estricto, rango válido y periodo abierto. |
| Texto libre | Longitud máxima; salida codificada para evitar inyección de HTML. |
| Paginación | Enteros con límites máximos para evitar consultas abusivas. |

Las consultas se parametrizan mediante el mecanismo del ORM o controlador SQL elegido. No se concatena entrada del usuario en SQL.

## Autenticación y sesión

- Hash de contraseñas con un algoritmo diseñado para contraseñas y parámetros configurables.
- Cookies de sesión `HttpOnly`, `Secure` en producción y `SameSite` apropiado; si se usan tokens, los de acceso serán breves y los de renovación serán revocables.
- Protección CSRF cuando la autenticación dependa de cookies.
- Limitación de intentos de inicio de sesión y de endpoints costosos.
- Invalidación de sesión al cerrar sesión, desactivar al usuario o cambiar credenciales.
- Política CORS restringida a orígenes configurados; nunca reflejar cualquier origen con credenciales.

## Secretos y configuración

- Los secretos se entregan mediante variables de entorno o un almacén del proveedor de despliegue.
- Se versiona sólo un `.env.example` sin valores reales.
- `.env`, llaves, volcados, respaldos y archivos de credenciales se excluyen con `.gitignore`.
- Los registros y mensajes de error no incluyen contraseñas, cookies, tokens, cadenas de conexión ni datos financieros completos.
- Si un secreto se expone, se revoca y rota; borrar el archivo del último commit no es suficiente.

## Registro y auditoría

Se auditan inicio y cierre de sesión, fallos relevantes, cambios de rol, altas o bajas de cuentas, publicación o cancelación de pólizas y exportaciones. Cada evento registra fecha, usuario, empresa, acción, recurso, resultado y `requestId`, sin secretos.

## Casos de prueba de seguridad planeados

| ID | Caso | Resultado esperado |
| --- | --- | --- |
| SEG-01 | Solicitar una ruta protegida sin sesión. | 401 sin datos. |
| SEG-02 | Un VIEWER intenta crear una cuenta. | 403 y sin cambio persistido. |
| SEG-03 | Usuario de empresa A solicita una cuenta de empresa B. | 404 o 403 consistente, sin filtrar datos. |
| SEG-04 | Se envía un `companyId` ajeno en URL o cuerpo. | Rechazo y evento auditable. |
| SEG-05 | Código de cuenta duplicado en la misma empresa. | 409; en otra empresa puede ser válido. |
| SEG-06 | Póliza con debe distinto de haber. | 422 y ninguna línea persistida. |
| SEG-07 | Póliza con valor negativo, texto en importe o valor fuera de rango. | 422 y mensaje de campo controlado. |
| SEG-08 | Entrada con payload de SQL o HTML. | Se trata como dato; no ejecuta SQL ni script. |
| SEG-09 | Repetir intentos de inicio de sesión. | Limitación temporal sin revelar cuentas válidas. |
| SEG-10 | Token o sesión vencida. | 401; no se renueva de forma indefinida. |
| SEG-11 | Error interno forzado. | 500 con `requestId`, sin traza ni secreto en la respuesta. |
| SEG-12 | Buscar patrones de secretos en repositorio e historial. | Ningún secreto real encontrado. |

## Criterio de salida por sprint

- **Sprint 1:** este plan, roles, validaciones, manejo de secretos y casos de prueba están documentados.
- **Sprint 2:** los controles asociados al flujo implementado funcionan y tienen pruebas de integración.
- **Sprint 3:** autenticación, autorización, aislamiento, despliegue y pipeline se verifican en un entorno accesible.
- **Sprint 4:** se corrigen hallazgos, se ejecutan pruebas E2E y se reduce deuda de seguridad.
- **Final:** no existen fallas críticas conocidas y la suite completa alcanza al menos 90% de cobertura.
