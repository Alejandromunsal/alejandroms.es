![Install Proxmox](/assets/img/tutoriales/install-proxmox/Proxmox.webp)

md-info:
- Instalación de Debian 12 en LXC Proxmox
- Configuración de Nginx como servidor web
- Instalación y configuración de PHP y PHP-FPM
- Optimización del stack LEMP para producción
- madrid
- mala
- npm

related:
- Configurar SSL en Nginx | /services/nginx-ssl.html | bi-server | Aprende a securizar tu servidor web
- Instalar MySQL en LXC | /services/mysql-lxc.html | bi-database | Configura bases de datos en LXC
- Optimizar PHP-FPM | /services/php-fpm-setup.html | bi-gear | Mejora el rendimiento PHP

md-details:
- Tiempo estimado | bi-clock | 30-45 minutos
- Requisitos | bi-hdd-stack | Proxmox con LXC, Debian 12, acceso root
- Nivel | bi-terminal | Intermedio / Avanzado
- Lenguajes involucrados | bi-code-slash | Bash, PHP, configuración de Nginx


# Instalar Proxmox VE version 9.1.2

---

Proxmox VE está basado en Debian. Por esta razón, las imágenes de disco de instalación (archivos ISO) proporcionadas por Proxmox incluyen un sistema Debian completo, así como todos los paquetes necesarios de Proxmox VE.

El instalador te guiará durante todo el proceso de configuración, permitiéndote:

- Particionar los discos locales.
- Aplicar configuraciones básicas del sistema (zona horaria, idioma, red).
- Instalar todos los paquetes necesarios.

Este proceso no debería tardar más que unos pocos minutos. Instalar usando la ISO proporcionada es el método recomendado tanto para usuarios nuevos como para usuarios existentes.

Como alternativa, Proxmox VE puede instalarse sobre un sistema Debian ya existente. Esta opción solo se recomienda para usuarios avanzados, ya que requiere un conocimiento detallado de Proxmox VE.

---

## 1. Requisitos del sistema

Se recomienda utilizar hardware de servidor de alta calidad al ejecutar Proxmox VE en entornos de producción. Para reducir aún más el impacto de un fallo en un host, se puede ejecutar Proxmox VE en un clúster con máquinas virtuales y contenedores de alta disponibilidad (HA).

Proxmox VE puede utilizar almacenamiento local (DAS), SAN, NAS y almacenamiento distribuido como Ceph RBD. Para más detalles, consulta el capítulo de almacenamiento.

---

### 1.1. Requisitos mínimos (solo para evaluación)

Estos requisitos mínimos son solo para fines de evaluación y **no deben utilizarse en producción**.

- **CPU:** 64 bits (Intel 64 o AMD64)  
- CPU/motherboard compatible con Intel VT/AMD-V para soporte completo de virtualización KVM  
- **RAM:** 1 GB, más la memoria adicional necesaria para las máquinas virtuales invitadas  
- **Almacenamiento:** Disco duro disponible  
- **Red:** Una tarjeta de red (NIC)  

---

### 1.2. Requisitos recomendados del sistema

- **CPU:** Intel 64 o AMD64 con la bandera Intel VT/AMD-V
- **Memoria:** Mínimo 2 GB para el sistema operativo y los servicios de Proxmox VE, más la memoria asignada a las máquinas virtuales. Para Ceph y ZFS se requiere memoria adicional (aproximadamente 1 GB por cada TB de almacenamiento utilizado).
- **Almacenamiento rápido y redundante**, preferiblemente SSD
- **Almacenamiento del SO:** RAID por hardware con caché de escritura protegida por batería (BBU) o no-RAID con ZFS (opcional SSD para ZIL)
- **Almacenamiento de VMs:**
  - Para almacenamiento local: RAID por hardware con BBU o no-RAID para ZFS y Ceph
  - ZFS y Ceph **no son compatibles** con controladores RAID por hardware
  - Se puede utilizar almacenamiento compartido o distribuido
  - SSDs con protección ante pérdida de energía (PLP) recomendados
  - Evitar SSDs de consumo general
- **Red:** NIC redundantes (Multi-Gbit), con NIC adicionales según la tecnología de almacenamiento y la configuración del clúster
- **PCI(e) passthrough:** CPU debe soportar la bandera VT-d/AMD-d


---

### 1.3. Resumen rápido de rendimiento

Para obtener una visión rápida del rendimiento de la CPU y disco en un sistema Proxmox VE instalado, puedes usar la herramienta incluida:

```bash
pveperf
```
---

## 2. Preparar el medio de instalación

Descarga la imagen ISO del instalador desde: [Proxmox VE ISO](https://www.proxmox.com/en/downloads/proxmox-virtual-environment/iso)

El medio de instalación de Proxmox VE es una **imagen ISO híbrida**, lo que significa que funciona de dos maneras:

- Como un archivo ISO listo para grabar en un CD o DVD.  
- Como un archivo de imagen de sectores crudos (IMG) listo para copiar en una memoria USB.

Te recomiendo usar una **memoria USB** para instalar Proxmox VE, ya que es la forma más rápida y sencilla.

---

### 2.1.  Instrucciones para GNU/Linux

En sistemas tipo Unix (Linux, BSD, etc.) puedes usar el comando `dd` para copiar la imagen ISO a la memoria USB.  

1. Primero identifica **el nombre correcto de tu memoria USB** (por ejemplo `/dev/sdd`).  
2. Después ejecuta el comando `dd` para escribir la ISO en la USB:

```bash
dd bs=1M conv=fdatasync if=./proxmox-ve_*.iso of=/dev/XYZ
```

> **Nota:** Asegúrate de reemplazar `/dev/XYZ` por el nombre correcto de tu memoria USB y de ajustar la ruta del archivo de entrada (`if`) según donde hayas guardado la ISO.  
> **Precaución:** Ten mucho cuidado de no sobrescribir otro disco por error.

---

#### 2.1.1. Encontrar el nombre correcto de la memoria USB

Hay dos formas de identificar el nombre de tu memoria USB:

1. **Usando `dmesg`:**  
   Compara las últimas líneas de la salida del comando `dmesg` **antes y después** de insertar la memoria USB. Esto te permitirá ver qué dispositivo se ha agregado.

2. **Usando `lsblk`:**  
   Abre una terminal y ejecuta:

```bash
lsblk
```
Esto mostrará una lista de todos los dispositivos de bloque conectados. Localiza tu memoria USB por tamaño y tipo de partición para identificar su nombre de dispositivo (por ejemplo /dev/sdd).

Después, inserta la memoria USB y vuelve a ejecutar el comando:

```bash
lsblk
```

Verás que aparece un nuevo dispositivo en la lista. Ese es el nombre de tu memoria USB (por ejemplo /dev/sdd), que usarás para copiar la ISO con dd.

---

### 2.2. Instrucciones para macOS

Abre la terminal (busca **Terminal** en Spotlight).  
Convierte el archivo `.iso` a formato `.dmg` usando la opción `convert` de `hdiutil`, por ejemplo:

```bash
hdiutil convert proxmox-ve_*.iso -format UDRW -o proxmox-ve_*.dmg
```

> **Consejo:** macOS tiende a añadir automáticamente la extensión `.dmg` al archivo de salida.  

Para ver la lista actual de dispositivos conectados, ejecuta:

```bash
diskutil list
```
Ahora, inserta la memoria USB y vuelve a ejecutar el comando para identificar qué nodo de dispositivo se le ha asignado (por ejemplo, `/dev/diskX`):

```bash
diskutil list
diskutil unmountDisk /dev/diskX
```
A continuación, escribe la imagen `.dmg` en la memoria USB usando `dd`:

```bash
sudo dd if=proxmox-ve_*.dmg bs=1M of=/dev/rdiskX
```
> **Nota:** En el comando anterior se usa `rdiskX` en lugar de `diskX`. Esto está intencionado y **aumenta la velocidad de escritura** en la memoria USB.

---

### 2.3. Instrucciones para Windows

##### Usando Etcher
Etcher funciona directamente, sin configuraciones complicadas.  
1. Descarga Etcher desde [https://etcher.io](https://etcher.io).  
2. Ábrelo y sigue los pasos para seleccionar la ISO de Proxmox VE y tu memoria USB.

##### Usando Rufus
Rufus es una alternativa más ligera, pero debes usar el **modo DD** para que funcione correctamente.  
1. Descarga Rufus desde [https://rufus.ie](https://rufus.ie).  
2. Puedes instalarlo o usar la versión portátil.  
3. Selecciona la memoria USB de destino y el archivo ISO de Proxmox VE.  
> **Importante:** Al iniciar, haz clic en **No** cuando aparezca el diálogo preguntando por descargar otra versión de GRUB. En el siguiente diálogo, selecciona el **modo DD**.

---
## 3. Usando el instalador de Proxmox VE
La imagen ISO del instalador incluye:

- Sistema operativo completo (Debian Linux, 64-bit)  
- Instalador de Proxmox VE, que particiona el/los disco(s) locales con **ext4, XFS, BTRFS (preview)** o **ZFS** e instala el sistema operativo  
- Kernel Linux de Proxmox VE con soporte para **KVM** y **LXC**  
- Conjunto completo de herramientas para administrar máquinas virtuales, contenedores, el host, clústeres y todos los recursos necesarios  
- Interfaz web de administración  

> **Nota:** Todos los datos existentes en los discos seleccionados se eliminarán durante la instalación. El instalador **no añade entradas al menú de arranque** de otros sistemas operativos.  

Inserta el medio de instalación preparado (por ejemplo, memoria USB o CD-ROM) y arranca desde él.  

> **Consejo:** Asegúrate de que el arranque desde el medio de instalación (por ejemplo, USB) esté habilitado en la configuración del firmware de tu servidor. El **Secure Boot** debe estar desactivado si arrancas un instalador de Proxmox VE anterior a la versión 8.1.

Después de seleccionar la opción de arranque correcta (por ejemplo, **Boot from USB**), aparecerá el menú de Proxmox VE. Aquí podrás elegir entre varias opciones: 

---

##### Install Proxmox VE (Graphical)

Comienza la instalación normal.

![Install Proxmox](/assets/img/tutoriales/install-proxmox/pve-grub-menu.png)

---

##### Install Proxmox VE (Terminal UI)

Inicia el asistente de instalación en **modo terminal**.

Ofrece prácticamente la misma experiencia que el instalador gráfico, pero suele tener **mejor compatibilidad con hardware muy antiguo o muy reciente**, por lo que puede ser una buena opción si el modo gráfico presenta problemas.

---

##### Install Proxmox VE (Terminal UI, Serial Console)

Inicia el asistente de instalación en modo terminal y además configura el kernel de Linux para utilizar el **primer puerto serie** del equipo como entrada y salida.

Esta opción está pensada para servidores **sin monitor ni interfaz gráfica (headless)** que solo disponen de acceso mediante consola serie.

![Install Proxmox](/assets/img/tutoriales/install-proxmox/pve-tui-installer.png)
 
---

##### Opciones Avanzadas: Install Proxmox VE (Graphical, Debug Mode)

Inicia la instalación en **modo depuración (debug)**.  
Se abrirá una consola en varios pasos del proceso de instalación, lo que permite diagnosticar problemas si algo falla.

Para salir de una consola de depuración, pulsa **CTRL + D**.

Esta opción también puede utilizarse para arrancar un sistema live con las herramientas básicas disponibles. Por ejemplo, permite:

- Reparar un **ZFS rpool** degradado
- Corregir el bootloader de una instalación existente de Proxmox VE

---

##### Opciones Avanzadas: Install Proxmox VE (Terminal UI, Debug Mode)

Igual que el modo debug gráfico, pero preparando el sistema para ejecutar el instalador basado en terminal.

---

##### Opciones Avanzadas: Install Proxmox VE (Serial Console Debug Mode)

Similar al modo debug en terminal, pero además configura el kernel de Linux para usar el **primer puerto serie** de la máquina como entrada y salida.

---

##### Opciones Avanzadas: Install Proxmox VE (Automated)

Inicia el instalador en modo **no asistido (unattended)**, incluso si la ISO no ha sido preparada correctamente para una instalación automática.

Puede utilizarse para:

- Obtener información del hardware
- Depurar configuraciones de instalación automatizada

Consulta la sección **Unattended Installation** para más información.

---

##### Opciones Avanzadas: Rescue Boot

Permite arrancar una instalación existente.

El sistema:

1. Busca instalaciones en todos los discos conectados.
2. Si encuentra una instalación válida, arranca directamente desde ese disco usando el kernel incluido en la ISO.

Es útil cuando existen problemas con:

- el bootloader (**GRUB** o **systemd-boot**)
- la BIOS/UEFI que no puede leer el sector de arranque del disco.

---

##### Opciones Avanzadas: Test Memory (memtest86+)

Ejecuta **memtest86+**, una herramienta para comprobar que la memoria RAM funciona correctamente y no contiene errores.

**Importante** Es necesario desactivar **Secure Boot** en la configuración UEFI para poder ejecutar esta opción.


Normalmente se selecciona **Install Proxmox VE (Graphical)** para iniciar la instalación. A continuación, puedes seleccionar el/los disco(s) duro(s) de destino para la instalación.

![Install Proxmox](/assets/img/tutoriales/install-proxmox/pve-select-target-disk.png)

El botón **Opciones** permite seleccionar el sistema de archivos de destino, que por defecto es **ext4**.  
El instalador utiliza **LVM** si eliges **ext4** o **XFS** como sistema de archivos, y ofrece opciones adicionales para limitar el espacio de LVM (ver más abajo).

También es posible instalar **Proxmox VE en ZFS**.  
Como ZFS ofrece varios niveles de **RAID por software**, esta opción es útil en sistemas que no disponen de un controlador RAID por hardware. Los discos de destino deben seleccionarse en el diálogo **Opciones**, y ajustes adicionales específicos de ZFS se pueden configurar en **Opciones Avanzadas**.

En la siguiente página se solicitan **opciones de configuración básicas**, como tu **ubicación**, **zona horaria** y **disposición del teclado**. La ubicación se utiliza para seleccionar un **servidor de descargas cercano**, lo que ayuda a aumentar la velocidad de las actualizaciones.  

Normalmente, el instalador puede **detectar estos ajustes automáticamente**, por lo que solo necesitarás cambiarlos en situaciones excepcionales:  
- cuando la detección automática falle, o  
- cuando quieras utilizar una **disposición de teclado poco común** en tu país.

![Install Proxmox](/assets/img/tutoriales/install-proxmox/pve-select-location.png)

A continuación, debes **especificar la contraseña del superusuario (root)** y una **dirección de correo electrónico**.  

La contraseña debe tener **al menos 8 caracteres**, aunque se **recomienda encarecidamente usar una contraseña más fuerte**. Algunas pautas útiles son:

- Utiliza una longitud mínima de **12 caracteres**.
- Incluye **letras minúsculas y mayúsculas**, **números** y **símbolos**.
- Evita:
  - Repetición de caracteres o patrones de teclado.
  - Palabras comunes del diccionario o secuencias de letras/números.
  - Nombres de usuario, nombres de familiares o mascotas, relaciones románticas (actuales o pasadas).
  - Información biográfica, como números de identificación, nombres de antepasados o fechas importantes.

![Install Proxmox](/assets/img/tutoriales/install-proxmox/pve-set-password.png)

La **dirección de correo electrónico** se utiliza para enviar notificaciones al **administrador del sistema**. Por ejemplo:

- Información sobre **actualizaciones de paquetes disponibles**.
- Mensajes de error generados por **tareas periódicas (cron jobs)**.

Todos esos correos de notificación se enviarán a la **dirección de correo electrónico** que hayas especificado.  

El **último paso** es la **configuración de red**. Las interfaces de red que están activas muestran un **círculo relleno** delante de su nombre en el menú desplegable.  

Ten en cuenta que durante la instalación solo puedes especificar una **dirección IPv4 o IPv6**, pero **no ambas**. Para configurar un nodo con **dual stack**, añade las direcciones IP adicionales **después de la instalación**.

![Install Proxmox](/assets/img/tutoriales/install-proxmox/pve-setup-network.png)

El siguiente paso muestra un **resumen de las opciones seleccionadas** previamente. Revisa cada configuración cuidadosamente y usa el botón **Anterior** si necesitas cambiar algún ajuste.  

Después de hacer clic en **Instalar**, el instalador comenzará a **formatear los discos** y a **copiar los paquetes** al disco o discos de destino.  
Espera a que este proceso termine; después, **retira el medio de instalación** y **reinicia el sistema**.

![Install Proxmox](/assets/img/tutoriales/install-proxmox/pve-installation.png)

La **copia de los paquetes** suele tardar varios minutos, dependiendo principalmente de la **velocidad del medio de instalación** y del **rendimiento del disco de destino**.  

Cuando la copia y la configuración de los paquetes haya terminado, puedes **reiniciar el servidor**.  
Por defecto, esto se hará **automáticamente después de unos segundos**.

![Install Proxmox](/assets/img/tutoriales/install-proxmox/pve-install-summary.png)

---

### 3.1. Acceder a la Interfaz de Gestión después de la Instalación

Tras completar la instalación y reiniciar el sistema, puedes **utilizar la interfaz web de Proxmox VE** para continuar con la configuración.

1. Apunta tu navegador a la **dirección IP** configurada durante la instalación y al **puerto 8006**, por ejemplo:  
`https://tu-direccion-ip:8006`

2. Inicia sesión usando el usuario **root (realm PAM)** y la **contraseña** que elegiste durante la instalación.

3. Sube tu **clave de suscripción** para acceder al repositorio Enterprise.  
Si no dispones de suscripción, deberás configurar uno de los **repositorios públicos**, menos probados, para recibir actualizaciones de **seguridad, correcciones de errores y nuevas funciones**.

4. Verifica la **configuración de IP** y el **hostname**.

5. Verifica la **zona horaria**.

6. Verifica la **configuración del firewall**.

![Install Proxmox](/assets/img/tutoriales/install-proxmox/gui-login-window.png)

---

### 3.2. Opciones Avanzadas de Configuración de LVM

El instalador crea un **Volume Group (VG)** llamado `pve` y **Logical Volumes (LVs)** llamados `root`, `data` y `swap` si se utiliza **ext4** o **xfs**. Para controlar el tamaño de estos volúmenes se pueden usar los siguientes parámetros:

- **hdsize**  
  Define el tamaño total del disco a utilizar. Esto permite reservar espacio libre en el disco para particiones adicionales (por ejemplo, para un PV y VG adicional que pueda usarse para almacenamiento LVM).

- **swapsize**  
  Define el tamaño del volumen swap. Por defecto es igual al tamaño de la memoria instalada, mínimo 4 GB y máximo 8 GB.  
  El valor resultante no puede ser mayor que un octavo del tamaño del disco (`hdsize/8`).  
  **Nota:** Si se establece a 0, no se creará volumen swap.

- **maxroot**  
  Define el tamaño máximo del volumen root, donde se almacena el sistema operativo.  
  - Con más de 48 GiB de almacenamiento disponible, el valor por defecto es un cuarto del disco (`hdsize/4`), con un máximo de 96 GiB.  
  - Con menos de 48 GiB disponibles, el tamaño del root será al menos la mitad del disco (`hdsize/2`).

- **maxvz**  
  Define el tamaño máximo del volumen de datos. El tamaño real del volumen de datos se calcula como:  
    datasize = hdsize - rootsize - swapsize - minfree

    Donde `datasize` no puede ser mayor que `maxvz`.  
    **Nota:** En LVM thin, el pool de datos solo se creará si `datasize` es mayor que 4 GB.  
    **Nota:** Si se establece a 0, no se creará volumen de datos y la configuración de almacenamiento se adaptará automáticamente.

- **minfree**  
  Define el espacio libre que se debe dejar en el VG `pve`.  
  - Con más de 128 GB de almacenamiento, por defecto se dejan 16 GB.  
  - En caso contrario, se usa `hdsize / 8`.  
    **Nota:** LVM necesita espacio libre en el VG para la creación de snapshots (no necesario para snapshots en LVM thin).

---

### 3.3. Opciones Avanzadas de Configuración de ZFS

Si se utiliza ZFS, el instalador crea el pool `rpool`. No se crea swap por defecto, pero puedes reservar espacio sin particionar en los discos de instalación o crear un **zvol de swap** después de la instalación (aunque esto puede causar problemas, ver notas de swap en ZFS).

- **ashift**  
Define el valor de `ashift` del pool. Debe ser al menos igual al tamaño de sector de los discos subyacentes (2^ashift = tamaño de sector), incluyendo discos de reemplazo.

- **compress**  
Define si se activa la compresión en `rpool`.

- **checksum**  
Define el algoritmo de checksumming a usar en `rpool`.

- **copies**  
Define el parámetro `copies` para `rpool`. Consulta el manual `zfs(8)` para detalles.

- **ARC max size**  
Define el tamaño máximo que puede alcanzar la ARC, limitando la memoria que ZFS usará.

- **hdsize**  
Define el tamaño total de disco a usar. Solo se aplica a discos de arranque (el primero o espejos en RAID0, RAID1, RAID10 y todos los discos en RAID-Z[123]).

---

### 3.4 Opciones avanzadas de configuración de BTRFS

No se crea espacio de intercambio (swap) cuando se utiliza BTRFS, pero puedes reservar espacio sin particionar en los discos de instalación para usarlo como swap. Puedes crear:

- una partición independiente,
- un subvolumen BTRFS,
- o un archivo de intercambio (swapfile) usando el comando btrfs filesystem mkswapfile.

**compress**

Define si la compresión está habilitada para el subvolumen BTRFS.
Se admiten distintos algoritmos de compresión:

- on (equivalente a zlib)
- zlib
- lzo
- zstd

El valor predeterminado es off (desactivado).

**hdsize**

Define el tamaño total del disco duro que se utilizará.
Esto es útil para reservar espacio libre en el/los disco(s) para particiones adicionales (por ejemplo, para crear una partición swap).

---

### 3.5. Consejo de Rendimiento:
ZFS funciona mejor con suficiente memoria. Se recomienda: `4 GB + 1 GB por cada TB de disco RAW`.  

Se puede usar un disco rápido como caché de escritura (ZFS Intent Log, ZIL):  

```bash
zpool add <nombre-del-pool> log /dev/path_to_fast_ssd
```
---

### 3.6 Añadir el parámetro del kernel `nomodeset`

En algunos casos pueden aparecer problemas con los controladores gráficos, especialmente en hardware muy antiguo o muy reciente.  
Si la instalación se queda bloqueada durante el arranque, puedes intentar añadir el parámetro **nomodeset**.

Este parámetro evita que el kernel de Linux cargue los drivers gráficos y obliga al sistema a continuar utilizando el framebuffer proporcionado por la BIOS/UEFI.

### Pasos para añadir `nomodeset`

1. En el menú de arranque de Proxmox VE, selecciona:

   **Install Proxmox VE (Terminal UI)**

2. Pulsa la tecla **`e`** para editar la entrada de arranque.

3. Usa las flechas del teclado hasta localizar la línea que comienza por: **linux**

4. Mueve el cursor al final de esa línea y añade: **nomodeset**. Añádelo separado por un espacio del último parámetro existente.

5. Pulsa **Ctrl + X** o **F10** para arrancar con la nueva configuración.

---

## 4. Instalación desatendida (Unattended Installation)

El método de instalación automatizada permite instalar **Proxmox VE sin intervención manual**, ideal para despliegues automatizados en servidores físicos (*bare-metal*).

Una vez completada la instalación y arrancado el sistema, puedes utilizar herramientas de automatización como **Ansible** para continuar configurando el servidor automáticamente.

#### Cómo funciona

El instalador necesita un **archivo de respuestas (answer file)** que contiene todas las opciones necesarias para la instalación, por ejemplo:

- Qué discos utilizar
- Qué interfaces de red configurar
- Ajustes del sistema

Este archivo también permite aplicar reglas de filtrado para seleccionar automáticamente el hardware adecuado.

#### Proceso general

1. Elegir una fuente desde la que se descargará el *answer file*.
2. Preparar una ISO de instalación configurada con esa fuente.
3. Arrancar el sistema usando esa ISO.

Una vez preparada correctamente, el menú de arranque mostrará una nueva opción: **Automated Installation**


Esta opción se seleccionará automáticamente tras **10 segundos**.

Para configuraciones más avanzadas, puedes consultar la wiki oficial de Proxmox.

---

## 5. Instalar Proxmox VE sobre Debian

Proxmox VE también puede instalarse como un conjunto de paquetes sobre una instalación estándar de Debian.

Después de configurar los repositorios necesarios, ejecuta los siguientes comandos:

```bash
apt-get update
apt-get install proxmox-ve
```

Instalar sobre una instalación existente de Debian parece sencillo, pero presupone que el sistema base se ha instalado correctamente y que sabes cómo quieres configurar y utilizar el almacenamiento local.

También necesitas configurar la red manualmente.

En general, esto no es algo trivial, especialmente cuando se utilizan LVM o ZFS.

Se puede encontrar una guía detallada paso a paso en la wiki.


