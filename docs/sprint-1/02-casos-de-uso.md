# Casos de uso

## Resumen

| ID | Caso de uso | Actor principal | Resultado |
| --- | --- | --- | --- |
| CU-01 | Iniciar sesión | Cualquier integrante | Sesión autenticada y empresa activa seleccionada. |
| CU-02 | Gestionar integrantes y roles | Administrador | Membresías y permisos actualizados. |
| CU-03 | Administrar catálogo de cuentas | Administrador o contador | Cuenta creada, actualizada o desactivada. |
| CU-04 | Registrar póliza contable | Contador | Póliza balanceada publicada. |
| CU-05 | Consultar movimientos y saldos | Integrante autorizado | Mayor de cuenta filtrado por periodo. |
| CU-06 | Generar balance general | Integrante autorizado | Activos, pasivos, capital y comprobación del balance. |
| CU-07 | Generar estado de resultados | Integrante autorizado | Ingresos, gastos y utilidad o pérdida del periodo. |
| CU-08 | Analizar evolución mensual | Integrante autorizado | Serie mensual, variación y promedio histórico. |
| CU-09 | Exportar estado financiero | Integrante autorizado | PDF con el reporte consultado. |

## CU-01 Iniciar sesión

**Precondición:** el usuario tiene una cuenta activa y una membresía vigente.

**Flujo principal:**

1. El usuario captura correo y contraseña.
2. El servidor valida formato, credenciales, estado del usuario y límite de intentos.
3. El sistema crea una sesión segura.
4. El usuario selecciona una empresa si pertenece a más de una.
5. El sistema muestra el panel correspondiente a su rol.

**Alternativas:** credenciales inválidas producen un error genérico; una cuenta bloqueada no inicia sesión; una solicitud excesiva recibe limitación temporal.

**Postcondición:** existe una sesión autenticada y auditable, sin revelar credenciales en registros.

## CU-02 Gestionar integrantes y roles

**Precondición:** sesión activa con rol de administrador en la empresa.

**Flujo principal:** el administrador consulta integrantes, invita o selecciona uno, asigna un rol permitido y guarda. El servidor verifica que el administrador actúa sobre su propia empresa y registra el cambio.

**Alternativas:** un contador o consultor recibe 403; un correo inválido recibe 422; no se permite retirar al último administrador activo.

## CU-03 Administrar catálogo de cuentas

**Precondición:** sesión de administrador o contador.

**Flujo principal:** el usuario captura código, nombre, tipo y subtipo; el servidor valida unicidad y catálogo; la cuenta se crea dentro de la empresa activa.

**Alternativas:** un código duplicado recibe 409; datos inválidos reciben 422; una cuenta con movimientos se desactiva en lugar de eliminarse.

## CU-04 Registrar póliza contable

**Precondición:** sesión de contador, periodo abierto y cuentas activas de la empresa.

**Flujo principal:**

1. El contador indica fecha, concepto y líneas de movimiento.
2. Cada línea selecciona una cuenta y captura un cargo o un abono mayor que cero.
3. El servidor valida pertenencia de cuentas, periodo, importes y permisos.
4. El sistema comprueba que total debe es igual a total haber.
5. La póliza se guarda de forma transaccional y se registra en auditoría.

**Alternativas:** póliza descuadrada, cuenta ajena, periodo cerrado o importe inválido reciben 422 o 403 según corresponda; si falla una línea, no se guarda ninguna.

## CU-05 Consultar movimientos y saldos

**Precondición:** sesión autorizada.

**Flujo principal:** el usuario elige cuenta y periodo; el sistema valida pertenencia, calcula saldo inicial y muestra movimientos ordenados con saldo acumulado.

**Alternativas:** una cuenta ajena se trata como recurso no accesible; un intervalo inválido recibe 422.

## CU-06 Generar balance general

**Precondición:** sesión autorizada y fecha de corte válida.

**Flujo principal:** el sistema agrega cuentas de activo, pasivo y capital, muestra subtotales y compara activo contra pasivo más capital.

**Alternativa:** si existe descuadre, el reporte se genera con una advertencia visible y queda evidencia para revisión.

## CU-07 Generar estado de resultados

**Precondición:** sesión autorizada y periodo válido.

**Flujo principal:** el sistema agrega ingresos y gastos, calcula utilidad o pérdida y presenta el detalle por cuenta.

**Alternativa:** si no existen movimientos, el reporte muestra importes en cero y no inventa datos.

## CU-08 Analizar evolución mensual

**Precondición:** sesión autorizada y al menos un periodo seleccionado.

**Flujo principal:** el usuario elige un intervalo; el sistema calcula resultado mensual, variación contra el mes anterior y promedio; la interfaz muestra tabla y gráfica.

**Alternativa:** cuando el mes anterior es cero, el sistema indica que la variación porcentual no aplica.

## CU-09 Exportar estado financiero

**Precondición:** un balance general o estado de resultados ya fue autorizado y generado.

**Flujo principal:** el usuario solicita PDF; el sistema vuelve a validar permisos, genera el archivo con empresa, periodo, fecha e importes y registra la exportación.

**Alternativa:** una sesión vencida debe autenticarse otra vez; un reporte ajeno nunca se exporta.
