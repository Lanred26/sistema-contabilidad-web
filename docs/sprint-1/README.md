# Entrega del Sprint 1

## Objetivo

Definir una base verificable para desarrollar el Sistema de Contabilidad Web durante los siguientes sprints. Esta entrega cubre planeación, coherencia funcional, diseño técnico, seguridad y organización del trabajo.

## Entregables

| Evidencia solicitada | Documento | Estado |
| --- | --- | --- |
| Requisitos funcionales y no funcionales | [01-requisitos.md](01-requisitos.md) | Completo |
| Casos de uso | [02-casos-de-uso.md](02-casos-de-uso.md) | Completo |
| Modelo entidad relación | [03-modelo-er.md](03-modelo-er.md) | Completo a nivel lógico |
| Historias y criterios de aceptación | [04-historias-de-usuario.md](04-historias-de-usuario.md) | Completo para el MVP |
| Diseño de controladores, modelos, rutas y middlewares | [05-arquitectura.md](05-arquitectura.md) | Completo a nivel de diseño |
| Validaciones, roles, secretos y casos de prueba | [06-seguridad.md](06-seguridad.md) | Completo a nivel de plan |
| Responsables, metas, tareas, Gitflow y evidencias | [07-plan-y-evidencias.md](07-plan-y-evidencias.md) | Completo localmente; falta tablero remoto |

## Trazabilidad principal

| Necesidad de la propuesta | Requisitos | Casos de uso | Historias |
| --- | --- | --- | --- |
| Administrar activos, pasivos y capital | RF-03, RF-04 | CU-03, CU-04 | HU-03, HU-04 |
| Calcular totales y utilidades | RF-06, RF-07 | CU-06, CU-07 | HU-06, HU-07 |
| Consultar evolución mensual | RF-08 | CU-08 | HU-08 |
| Generar estados financieros | RF-06, RF-07 | CU-06, CU-07 | HU-06, HU-07 |
| Usar el sistema desde un navegador | RNF-01, RNF-02 | Todos | HU-01 a HU-09 |
| Proteger información por empresa | RF-01, RF-02, RNF-06 | CU-01, CU-02 | HU-01, HU-02 |

## Definiciones de alcance

- **MVP:** autenticación, empresa, roles, catálogo, pólizas balanceadas, movimientos, balance general, estado de resultados, tendencia mensual y exportación PDF.
- **Fuera del primer avance:** código ejecutable, base de datos desplegada, pruebas automatizadas en ejecución, infraestructura y CI/CD. Esas evidencias comienzan en sprints posteriores según la rúbrica.
- **Fuera del MVP:** facturación electrónica, nómina, conciliación bancaria automática, inventarios y obligaciones fiscales.

## Decisiones confirmadas

- Se utilizará MySQL como motor de base de datos. La propuesta original contemplaba MySQL o PostgreSQL; posteriormente el equipo eligió MySQL por disponibilidad y experiencia previa.

## Pendientes antes de la revisión

- Reemplazar la URL de ejemplo por el repositorio real.
- Confirmar con el equipo las asignaciones propuestas.
- Crear el tablero, issues y pull requests en GitHub para que la evidencia exista en la plataforma solicitada.
