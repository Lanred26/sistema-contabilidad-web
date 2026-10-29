# Colaboración y revisión del profesor

## Flujo por integrante

Cada persona usa su propia cuenta de GitHub para que los commits y revisiones identifiquen a su autor. No compartan contraseñas ni usen la cuenta de un solo integrante para trabajar todos.

1. Clonen el repositorio público: `git clone https://github.com/USUARIO/sistema-contabilidad-web.git`.
2. Entren a `develop` y actualicen: `git switch develop` y `git pull origin develop`.
3. Creen una rama por issue: `git switch -c feature/S2-01-catalogo-cuentas`.
4. Hagan cambios pequeños, ejecuten las pruebas y registren commits con prefijos claros, por ejemplo `feat: add account catalog endpoint` o `test: cover unbalanced journal rejection`.
5. Publiquen su rama con `git push -u origin feature/S2-01-catalogo-cuentas`.
6. Abran un Pull Request (PR) de la rama hacia `develop`, enlacen el issue y describan cambios, pruebas y capturas pertinentes.
7. Otro integrante revisa el PR. Atiendan observaciones con commits nuevos y soliciten revisión de nuevo.
8. Cuando el PR esté aprobado y pase las verificaciones, intégrenlo a `develop` con squash merge. `main` conserva versiones que el equipo considera estables.

No se deben hacer commits directamente a `main` o `develop`. Cada integrante debe crear su rama desde `develop` y solicitar PR; así quedan visibles la contribución y revisión de cada persona.

## Acceso para los tres integrantes

Al ser público, cualquiera puede ver y clonar el código. Para que los otros dos puedan subir ramas y abrir PR necesitan tener una cuenta de GitHub y ser colaboradores con permiso de escritura (o pertenecer a la organización propietaria). El dueño del repositorio los agrega en GitHub: **Settings → Collaborators**. No necesitan permiso de administración; el dueño puede proteger `main` y `develop` para exigir PR.

## Revisión del profesor

- Compartan la URL pública del repositorio y el enlace del tablero/Projects si llevan tareas ahí.
- Para cada entrega, creen un PR de `develop` hacia `main` con título `Sprint 2: implementación inicial` (y de forma equivalente en cada sprint). El profesor puede revisar el diff, commits, pruebas y conversaciones del PR.
- Si el profesor necesita comentar en PR privados, debe ser agregado con permiso de lectura. En un repo público puede revisar sin ser colaborador.
- Etiqueten cada PR con el sprint y enlacen las tareas para trazar requerimientos, responsables y evidencia.
- Mantengan `README.md`, las instrucciones de ejecución y las pruebas alineadas con la versión de la rama revisada.

## Evidencia mínima por avance

- Issue con responsable, criterio de aceptación y sprint.
- Rama `feature/*` con commits atribuibles al integrante.
- PR dirigido a `develop`, enlace al issue, resumen y resultado de pruebas.
- Revisión de otro integrante y resolución de comentarios.
- PR de entrega del sprint desde `develop` hacia `main` para que el profesor lo inspeccione.

La estructura local no contiene todavía una URL de GitHub. Sustituyan `USUARIO` por el dueño real y registren la URL en el README después de crear el remoto.
