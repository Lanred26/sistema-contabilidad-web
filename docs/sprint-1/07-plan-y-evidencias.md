# Plan, responsables y evidencias

## Meta del Sprint 1

Presentar una planeación coherente y trazable que permita iniciar el desarrollo del flujo de autenticación, catálogo y pólizas en el Sprint 2, con responsabilidades, criterios de aceptación y controles de seguridad definidos.

## Responsabilidades propuestas

La rúbrica exige tareas con responsables y evidencia de la contribución de cada integrante, pero no prescribe cargos ni esta distribución nominal. Landon eligió cuatro tareas técnicas; las ocho tareas restantes se repartieron al azar entre los otros cuatro integrantes, dos para cada uno. El equipo debe confirmar la propuesta.

| Integrante | Responsabilidad principal en Sprint 1 | Evidencia |
| --- | --- | --- |
| Landon Enrique Reyes De Lira | Modelo ER, decisión de MySQL, arquitectura y endpoints | Modelo de datos, decisión registrada, diseño de capas y contratos preliminares de API. |
| Ian Slash Contreras García | Requisitos e historias de usuario | Requisitos revisados e historias con criterios de aceptación. |
| Arturo Martínez Diaz De León | Casos de uso y coordinación de pull requests | Casos de uso revisados y pull requests de documentación. |
| Ángel Emmanuel Ortega Sánchez | Alcance del MVP y tablero de GitHub | Alcance acordado e issues con responsables. |
| Marco Antonio Calvillo Durón | Seguridad y coordinación de la revisión | Matriz de permisos, casos de prueba y recorrido de la evidencia. |

## Backlog listo para crear como issues

| ID | Tarea | Responsable propuesto | Criterio de terminado | Estado local |
| --- | --- | --- | --- | --- |
| S1-01 | Confirmar alcance del MVP y exclusiones | Ángel | El equipo aprueba alcance y pendientes en una minuta o issue. | Documentado |
| S1-02 | Revisar requisitos funcionales y no funcionales | Ian | Cada requisito tiene ID, prioridad y verificación. | Documentado |
| S1-03 | Validar casos de uso contra la propuesta | Arturo | Actores, precondiciones, flujos y alternativas son coherentes. | Documentado |
| S1-04 | Revisar modelo ER y restricciones | Landon | Entidades, llaves, relaciones y reglas de pólizas están definidas. | Documentado |
| S1-05 | Registrar la decisión de utilizar MySQL | Landon | La arquitectura, modelo y plan identifican MySQL y justifican la elección. | Documentado |
| S1-06 | Revisar arquitectura por capas | Landon | Rutas, controladores, servicios, repositorios y middlewares tienen límites claros. | Documentado |
| S1-07 | Revisar endpoints y códigos HTTP | Landon | Cada flujo del MVP tiene contrato preliminar y roles. | Documentado |
| S1-08 | Revisar historias y aceptación | Ian | Las historias prioritarias son comprobables y trazables. | Documentado |
| S1-09 | Revisar amenazas y pruebas de seguridad | Marco | Validaciones, roles, secretos y casos negativos están definidos. | Documentado |
| S1-10 | Crear tablero e issues en GitHub | Ángel | Todos los items existen en GitHub con responsable, criterio y fecha. | Pendiente externo |
| S1-11 | Coordinar ramas y pull requests de documentación | Arturo | Todos contribuyen; cambios revisados e integrados a `develop` mediante PR. | Pendiente externo |
| S1-12 | Coordinar demostración del Sprint 1 | Marco | Todos presentan; se puede recorrer evidencia y explicar decisiones en la revisión. | Pendiente |

## Definición de terminado del Sprint 1

- Los requisitos, casos, modelo ER e historias son coherentes entre sí.
- Cada historia priorizada tiene criterios de aceptación observables.
- El diseño separa rutas, controladores, servicios, modelos/repositorios y middlewares.
- El plan de seguridad cubre validación, roles, secretos y pruebas negativas.
- Cada tarea tiene una persona responsable y un resultado esperado.
- El tablero de GitHub refleja el estado real y conserva evidencia de contribuciones.
- Las decisiones pendientes están visibles y no se presentan como resueltas.

## Flujo de Git

- `main`: versiones estables y entregas.
- `develop`: integración del sprint.
- `feature/<id>-<descripcion>`: una tarea o funcionalidad concreta.
- `release/*`: preparación de una versión evaluable cuando corresponda.
- `hotfix/*`: correcciones urgentes sobre una versión estable.

Cada cambio entra mediante pull request hacia `develop`, con al menos una revisión del equipo. Los commits deben ser pequeños, oportunos y describir el cambio, por ejemplo `docs: define modelo ER del sprint 1`.

## Evidencias para la revisión

| Evidencia | Cómo mostrarla |
| --- | --- |
| Planeación | Recorrer el índice, trazabilidad, backlog y definición de terminado. |
| Coherencia | Seleccionar una historia y seguirla hacia requisito, caso, entidad, endpoint y prueba. |
| Arquitectura | Explicar el diagrama y por qué la lógica no vive en rutas ni controladores. |
| Seguridad | Demostrar matriz de roles, aislamiento por empresa, validaciones y casos SEG-01 a SEG-12. |
| GitHub | Mostrar tablero, issues asignados, ramas, commits y pull requests reales. |
| Aportación individual | Filtrar issues, commits y revisiones por integrante. |

## Riesgos y mitigaciones

| Riesgo | Impacto | Mitigación |
| --- | --- | --- |
| Usar convenciones inconsistentes para UUID, decimales o transacciones en MySQL | Provoca migraciones incompatibles o errores contables. | Definir precisión monetaria, representación UUID y versión objetivo antes de la primera migración. |
| Mantener la URL de repositorio de ejemplo | Falta evidencia verificable. | Registrar la URL real en README, propuesta y tablero. |
| Asignaciones no confirmadas | Trabajo duplicado o sin dueño. | Confirmar tabla de responsables y actualizar issues. |
| Copiar el modelo acumulado del prototipo C++ | Se pierde trazabilidad de movimientos. | Persistir pólizas y líneas; calcular saldos. |
| Autorizar sólo por identificador | Riesgo crítico de acceso a datos ajenos. | Filtrar por empresa y verificar membresía en cada servicio y repositorio. |
| Commits hechos al final del sprint | No demuestran avance ni contribución. | Integrar cambios pequeños durante el sprint mediante PR. |

## Pendientes externos

- URL real del repositorio de GitHub.
- Tablero, issues, ramas, commits y pull requests; no pueden demostrarse sólo con archivos locales.
- Confirmación de responsables y fechas por el equipo.
- Verificación de la versión y configuración local de MySQL al iniciar el Sprint 2.
