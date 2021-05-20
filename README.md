# Arca API

La aplicación para el administrador de contenido del proyecto Arca.

## Instalación

**Debes tener instalado Docker.**

1. Clonar este repositorio.
2. Pedir el último dump y poner el archivo `.sql` en la carpeta `/cms/dump/` 
3. Iniciar contenedores:

```bash
docker-compose up -d
```
En la primera iniciada de los contenedores a veces es bueno dejarlo sin `-d` para ir viendo todo el primer proceso de instalación y preparación de los contenedores, si hay errores los vamos a poder ver en el terminal. Pero luego de tenerlos instalados, cada ves que queremos iniciar los contenedores podemos poner el flag `-d` para que el terminal no quede ocupada.

Esto va a instalar 4 aplicaciones en 4 contenedores separados que se conectan entre si (Ver archivo `docker-compose.yml`):

- **Directus**: El CMS disponible en [localhost:8055](http://localhost:8055) (El usuario y clave lo deben pedir en privado).
- **Postgres**: La base de datos.
- **Redis**: El sistema de Cache.
- **PgAdmin 4**: GUI para trabajar con la base de datos desde [localhost:5050](http://localhost:5050)

### Carpeta `/cms/dump` con archivo `sql`

En la primera vez que iniciamos `docker-compose up`, el archivo que este en `/cms/dump/**.sql` se va a copiar a la carpeta `/docker-entrypoint-initdb.d` dentro del contenedor que tiene el Postgres (base de datos). Al encontrarse con ese archivo en una instalación nueva del contenedor, este se va a saltar los valores predeterminados del `docker-compose` y va a llenar las tablas con los datos y schema del `/cms/dump/**.sql`. Esto significa que toda la configuración de Directus y Colecciones que se han modelado en el, quedan iguales en nuestro Directus de desarrollo local.

Esto quiere decir que cuando tenemos un nuevo dump, luego de hacer un adelanto en el modelado de datos o configuración en Directus de manera local, se debe hacer un nuevo dump y compartirlo con los desarrolladores para que puedan volver a instalar el contendedor desde cero.

No es la manera ideal de trabajo y cuando instalemos el CMS en el servidor, esto se vuelve innecesario pues ya quedan los datos centralizados y disponibles a todos. De momento usamos este método para darle inicio al desarrollo y primeras pruebas.

#### Reiniciar la base de datos con un nuevo dump

Apagar los contenedores:

```bash
docker-compose down
```

Borrar la carpeta `./data` que se genera automáticamente dentro de la carpeta de este proyecto.

Volver a iniciar los contenedores:

```bash
docker-compose up -d
```

Esto vuelve a crear la carpeta local `./data` y la base de datos va a tener la nueva estructura del archivo `./dump/**.sql`.

#### Crear un dump para compartir cambios

Esto lo van a hacer luego de que se adelanten cambios importantes en Directus que necesiten compartir con los otros desarrolladores.

Teniendo los contenedores prendidos, usar el siguiente comando:

```bash
docker exec -t arca-cms-database pg_dump -U arca arca > ./cms/dump/arcabd.sql
```

Tener cuidado que esto va a reemplazar el archivo actual.

:exclamation: **En la carpeta `./dump` sólo debe existir 1 archivo de sql para que esto funcione.**

### (Opcional) Configuración PgAdmin 4

El administrador de PgAdmin permite tener una interfaz gráfica para ver, modificar y hacer todo tipo de *query* directo en la base de datos. Estos se ven reflejados en el Directus. *No es necesario usarlo pero queda incluido para facilitar algunos procesos manuales sobre la base de datos.*

Para ingresar se debe ir a: [localhost:5050](http://localhost:5050)

Admin: **admin@admin.com**  
Clave: **admin**

1. Hacer clic derecho sobre Server: Create -> Server...

![PgAdmin 1](./docs/pgAdmin-1.png)

2. En la pestaña General nombrar el servidor `arca`

![PgAdmin 2](./docs/pgAdmin-2.png)

3. En la pestaña Connections usar la siguiente configuración que son las mismas que usamos en el `docker-compose.yml`:

- Host: **arca-cms-database** _(Como tenemos la base de datos en un contenedor aparte, podemos usar el nombre de ese contenedor)_
- Port: **5432**
- Maintainance Database: **postgres** _(predeterminado)_
- Username: **arca**
- Password: **arca**
- Save Password: **[x]**

![PgAdmin 3](./docs/pgAdmin-3.png)

Al iniciar los contenedores importamos los datos así que esta conexión nos debe mostrar los datos en la sección `Schemas->Tables`, algo similar a esto:

![PgAdmin 4](./docs/pgAdmin-4.png)

Todas las tablas que inician con el nombre `directus_...` corresponden a la configuración del CMS Directus, las otras son las "Colecciones" que se crean y modelan dentro del CMS.