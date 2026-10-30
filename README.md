# Sistema de Contabilidad Web

Aplicación web para que pequeñas y medianas empresas administren su catálogo de cuentas, registren movimientos contables y consulten estados financieros desde un navegador.

El proyecto comenzó la implementación del Sprint 2 con una API REST en Node.js y Express, persistencia MySQL, autenticación mediante sesiones y los primeros flujos de catálogo, pólizas y mayor.

## Alcance inicial

- Acceso autenticado por empresa y por rol.
- Catálogo de cuentas contables.
- Registro de pólizas con cargos y abonos balanceados.
- Consulta de movimientos y saldos.
- Balance general y estado de resultados.
- Comparación mensual, porcentajes de variación y promedios históricos.
- Exportación de estados financieros a PDF.

## Tecnología propuesta

- Frontend: HTML5, CSS3 y JavaScript ES6+.
- Backend: Node.js y Express.js mediante una API REST.
- Base de datos: MySQL. El equipo decidió utilizarlo porque ya está disponible en su entorno de trabajo y cuenta con experiencia previa en varios proyectos.
- Bibliotecas previstas: Chart.js para gráficas y jsPDF para exportación.

La API sigue el ejemplo de clase de Express con `mysql2/promise`: archivo de configuración separado, rutas agrupadas, controladores y validaciones de solicitud. Se conserva JavaScript ES6 porque ésa fue la decisión registrada para este proyecto en el Sprint 1.

## Documentación

1. [Requisitos y alcance](docs/sprint-1/01-requisitos.md)
2. [Casos de uso](docs/sprint-1/02-casos-de-uso.md)
3. [Modelo entidad relación](docs/sprint-1/03-modelo-er.md)
4. [Historias de usuario](docs/sprint-1/04-historias-de-usuario.md)
5. [Arquitectura propuesta](docs/sprint-1/05-arquitectura.md)
6. [Plan de seguridad](docs/sprint-1/06-seguridad.md)
7. [Plan, responsables y evidencias](docs/sprint-1/07-plan-y-evidencias.md)


## Inicio rápido

1. Copia `.env.example` a `.env` y define una contraseña local.
2. Ejecuta `docker compose up -d` para iniciar MySQL 8.4.
3. Ejecuta `npm ci` y `npm run db:migrate`.
4. Para el desarrollo local, inicia la API con `npm run dev`.
