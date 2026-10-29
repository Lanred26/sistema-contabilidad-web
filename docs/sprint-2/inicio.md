# Sprint 2: implementación inicial

## Meta

Entregar un primer flujo funcional con persistencia MySQL, separación por capas, controles de seguridad y pruebas de integración, de acuerdo con [la meta del curso](../../project.md).

## Alcance implementado

- HU-01: inicio y cierre de sesión con cookies `HttpOnly`, token aleatorio guardado como hash, vencimiento y limitación de intentos.
- HU-03: consulta, alta y actualización/desactivación de cuentas; código único por empresa y autorización por rol.
- HU-04: alta transaccional de pólizas balanceadas, validación decimal exacta, cuentas activas de la empresa y bitácora.
- HU-05 parcial: consulta de movimientos de una cuenta y rango de fechas, filtrada por empresa.
- Validación de entrada, respuestas de error con `requestId`, Helmet y SQL parametrizado.
- Esquema reproducible con Docker Compose y migración idempotente.

## Arquitectura

Las rutas conectan middlewares con controladores; los controladores validan y traducen HTTP; servicios aplican reglas de negocio; repositorios contienen SQL; MySQL persiste usuarios, empresas, membresías, cuentas, pólizas, líneas, sesiones y auditoría.

## Preparar el entorno

Requisitos: Node.js 24 o posterior, npm y Docker Desktop iniciado.

```powershell
Copy-Item .env.example .env
# Edita .env y establece una contraseña local para DB_PASSWORD.
docker compose up -d
npm ci
npm run db:migrate
npm run dev
```

La configuración local de `.env` no se sube a Git. El esquema de MySQL se monta al crear el volumen por primera vez; `npm run db:migrate` permite aplicar de nuevo las tablas faltantes.

## Crear un usuario local de demostración

En desarrollo, habilita temporalmente `ENABLE_DEV_SEED=true` en `.env`, reinicia la API y envía:

```powershell
$body = @{ email = 'contador@example.test'; password = 'UnaClaveLocal-123'; name = 'Contador de prueba'; companyName = 'Empresa de prueba'; role = 'ADMIN' } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri http://localhost:3000/api/v1/auth/development-users -ContentType 'application/json' -Body $body
```

Deshabilita `ENABLE_DEV_SEED` después de crear el usuario. Este endpoint responde 404 en producción y no es un mecanismo de alta para producción.

## Endpoints disponibles

| Método | Ruta | Permiso |
| --- | --- | --- |
| `POST` | `/api/v1/auth/sessions` | Público, limitado por tasa |
| `DELETE` | `/api/v1/auth/sessions/current` | Sesión activa |
| `GET` | `/api/v1/companies/:companyId/accounts` | Membresía activa |
| `POST` | `/api/v1/companies/:companyId/accounts` | ADMIN o ACCOUNTANT |
| `PATCH` | `/api/v1/companies/:companyId/accounts/:accountId` | ADMIN o ACCOUNTANT |
| `POST` | `/api/v1/companies/:companyId/journal-entries` | ADMIN o ACCOUNTANT |
| `GET` | `/api/v1/companies/:companyId/accounts/:accountId/ledger?from=YYYY-MM-DD&to=YYYY-MM-DD` | Membresía activa |

La API asigna la empresa desde la URL sólo después de comprobar que el usuario tiene una membresía activa para esa empresa. Los importes de póliza se envían como cadenas decimales, no como números JSON.

## Pruebas de integración

Usa una base separada para que los datos de prueba no se mezclen con desarrollo. En una instalación nueva de Docker Compose se crea `contabilidad_test` automáticamente. Si el volumen MySQL ya existía antes de añadir esta configuración, crea la base una sola vez con:

```powershell
docker compose exec -T mysql mysql -uroot -plocal-root-only -e "CREATE DATABASE IF NOT EXISTS contabilidad_test; GRANT ALL PRIVILEGES ON contabilidad_test.* TO 'contabilidad_app'@'%';"
$env:DB_NAME = 'contabilidad_test'
npm run db:migrate
$env:TEST_DB_NAME = 'contabilidad_test'
npm run test:integration
Remove-Item Env:TEST_DB_NAME
$env:DB_NAME = 'contabilidad'
```

Las pruebas usan Vitest, como en los ejemplos de clase. Verifican sesión, acceso anónimo, cierre de sesión, alta y duplicidad de cuentas, aislamiento entre empresas, atomicidad de pólizas balanceadas y rechazo de pólizas descuadradas, y consulta del mayor. Requieren MySQL disponible y dependencias instaladas.

## Criterio de terminado y pendientes

- [x] Persistencia MySQL y flujo de catálogo.
- [x] Sesiones y permisos por membresía/rol.
- [x] Póliza balanceada guardada en transacción.
- [x] Pruebas de integración automatizadas escritas.
- [ ] Ejecutar las pruebas en MySQL local y guardar resultado reproducible.
- [ ] Revisar el cambio por Pull Request en GitHub.
- [ ] Registrar nombres y responsables reales de los tres integrantes, tareas e issues.
- [ ] Completar el mayor con saldo inicial/acumulado y avanzar UI en siguientes sprints.

El código sigue la práctica de clase con Express, `mysql2/promise`, consultas preparadas, validaciones con `express-validator`, pruebas con Vitest y un archivo de conexión separado. Los nombres de las guías se mantienen descriptivos para que el equipo encuentre rápido las instrucciones.
