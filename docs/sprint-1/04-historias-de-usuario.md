# Historias de usuario y criterios de aceptación

## HU-01 Acceso seguro

**Como** integrante, **quiero** iniciar y cerrar sesión **para** acceder únicamente a la información autorizada.

**Criterios de aceptación**

- Dado un usuario activo con credenciales válidas, cuando inicia sesión, entonces obtiene una sesión segura y accede a sus empresas.
- Dadas credenciales inválidas, cuando intenta ingresar, entonces recibe un mensaje genérico sin confirmar si el correo existe.
- Dada una ruta protegida sin sesión, cuando se solicita, entonces responde 401.
- Al cerrar sesión, la sesión anterior deja de ser válida.

## HU-02 Roles y aislamiento por empresa

**Como** administrador, **quiero** asignar roles **para** controlar quién consulta o modifica la contabilidad.

**Criterios de aceptación**

- Un administrador puede invitar, desactivar y cambiar el rol de integrantes de su empresa.
- Un contador y un consultor reciben 403 al intentar administrar integrantes.
- Ningún usuario puede leer o modificar recursos de una empresa sin membresía activa.
- No se puede dejar una empresa sin al menos un administrador activo.

## HU-03 Catálogo de cuentas

**Como** contador, **quiero** administrar cuentas contables **para** clasificar correctamente los movimientos.

**Criterios de aceptación**

- Se exigen código, nombre y tipo válidos.
- El código no se repite dentro de una empresa, aunque puede existir en otra.
- Una cuenta con movimientos se desactiva en lugar de eliminarse.
- Un consultor puede leer el catálogo, pero no modificarlo.

## HU-04 Registro de pólizas

**Como** contador, **quiero** registrar cargos y abonos **para** conservar movimientos contables consistentes.

**Criterios de aceptación**

- Una póliza exige fecha, concepto, dos o más líneas y cuentas activas de la empresa.
- Cada línea tiene exclusivamente un cargo o un abono positivo.
- La póliza se publica sólo cuando total debe es igual a total haber.
- Si una validación o escritura falla, no se persiste ninguna parte de la póliza.
- Un periodo cerrado rechaza nuevas pólizas.

## HU-05 Movimientos y saldos

**Como** integrante autorizado, **quiero** consultar el mayor de una cuenta **para** conocer su saldo y movimientos.

**Criterios de aceptación**

- La consulta acepta una cuenta propia y un periodo válido.
- Se muestran saldo inicial, fecha, referencia, concepto, debe, haber y saldo acumulado.
- El orden es cronológico y estable.
- Una cuenta de otra empresa no revela su existencia ni sus datos.

## HU-06 Balance general

**Como** dueño o contador, **quiero** generar un balance general **para** conocer la posición financiera a una fecha.

**Criterios de aceptación**

- El reporte agrupa activos, pasivos y capital y muestra subtotales.
- El reporte comprueba Activo = Pasivo + Capital.
- Un descuadre se muestra de forma visible.
- Las cifras provienen sólo de pólizas publicadas de la empresa y fecha seleccionadas.

## HU-07 Estado de resultados

**Como** dueño o contador, **quiero** generar un estado de resultados **para** conocer la utilidad o pérdida de un periodo.

**Criterios de aceptación**

- El reporte agrupa ingresos y gastos.
- La utilidad o pérdida es ingresos menos gastos.
- Un periodo sin movimientos muestra cero y no un error técnico.
- Las cifras respetan empresa, periodo y permisos.

## HU-08 Tendencia mensual

**Como** dueño, **quiero** comparar resultados mensuales **para** identificar cambios en el desempeño financiero.

**Criterios de aceptación**

- Se muestran resultado por mes, variación porcentual y promedio del intervalo.
- La gráfica y la tabla representan los mismos valores.
- Si el valor previo es cero, la variación se marca como no aplicable.
- El intervalo inválido se rechaza con 422.

## HU-09 Exportación a PDF

**Como** integrante autorizado, **quiero** exportar un estado financiero **para** compartir o archivar el resultado.

**Criterios de aceptación**

- El PDF identifica empresa, tipo de reporte, periodo y fecha de generación.
- Los importes coinciden con la vista web.
- El servidor vuelve a verificar autorización al generar el archivo.
- La exportación se registra en auditoría sin incluir información secreta.

## Priorización para implementación

| Prioridad | Historias | Meta sugerida |
| --- | --- | --- |
| Sprint 2 | HU-01, HU-03, HU-04 y parte de HU-05 | Primer flujo funcional con persistencia y pruebas de integración. |
| Sprint 3 | HU-02, HU-06, HU-07 y completar HU-05 | Integración, autorización, despliegue y CI/CD. |
| Sprint 4 | HU-08 y HU-09, correcciones y deuda técnica | Consolidación, E2E y endurecimiento de seguridad. |
