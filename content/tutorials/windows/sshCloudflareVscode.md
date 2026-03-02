![Install Proxmox](/assets/img/tutoriales/cloudflare-ssh-vscode/SSH%20+%20VSCode%20+%20Cloudflared%20Zero%20Trust.png)

md-info:
- Configuración de SSH con Cloudflare Zero Trust en Windows
- Creación y gestión de claves SSH (ed25519)
- Configuración de ssh-agent para carga automática de claves
- Integración con VS Code Remote SSH

related:
- Configurar Cloudflare Access | /services/cloudflare-access.html | bi-shield | Aprende a proteger tus aplicaciones con Zero Trust
- Crear claves SSH seguras | /services/ssh-keys.html | bi-key | Genera y gestiona pares de claves para acceso remoto
- VS Code Remote SSH | /services/vscode-remote.html | bi-terminal | Conecta tu editor directamente al servidor remoto

md-details:
- Tiempo estimado | bi-clock | 20-30 minutos
- Requisitos | bi-hdd-stack | Windows 10/11, VS Code, Cloudflare Zero Trust, acceso SSH al servidor
- Nivel | bi-terminal | Intermedio
- Lenguajes involucrados | bi-code-slash | PowerShell, SSH config

# Cómo Configurar SSH + Cloudflare Zero Trust + VS Code (Windows)

Este tutorial explica **paso a paso** cómo configurar un acceso SSH seguro usando:

- Cloudflare Zero Trust
- `cloudflared`
- SSH keys (`ed25519`)
- `ssh-agent` en Windows
- VS Code Remote SSH

El resultado final permite conectarse a:

```
ssh.example.es
```

sin introducir contraseña continuamente y de forma segura.

---

## 1. Instalar cloudflared

**Qué hacemos:** descargamos la herramienta de Cloudflare que nos permite abrir un túnel SSH seguro bajo Zero Trust.  
**Por qué:** cloudflared es necesario para autenticar el SSH a través de Cloudflare, en lugar de abrir directamente el puerto 22.

1. Descargar `cloudflared.exe` desde Cloudflare.
2. Crear carpeta:

```
C:\Program Files\cloudflared
```

3. Copiar dentro:

```
cloudflared.exe
```

---

## 2. Añadir cloudflared al PATH

**Qué hacemos:** añadimos la carpeta donde está `cloudflared.exe` a las variables de entorno.  
**Por qué:** así podemos ejecutar `cloudflared` desde cualquier terminal sin escribir la ruta completa.

Abrir:

```
Editar variables de entorno del sistema
```
![Editar variables de entorno del sistema](/assets/img/tutoriales/cloudflare-ssh-vscode/variablesDeEntorno.png)

Añadir a **Path (usuario o sistema)**:

```
C:\Program Files\cloudflared
```
![Path](/assets/img/tutoriales/cloudflare-ssh-vscode/path.png)

Cerrar y abrir PowerShell nuevo.

Verificar:

```powershell
cloudflared --version
```

---

## 3. Crear clave SSH ed25519

**Qué hacemos:** generamos un par de claves (privada y pública) de tipo ED25519.  
**Por qué:** ED25519 es más segura y rápida que RSA. La clave privada nunca se comparte; la pública va al servidor.

```powershell
ssh-keygen -t ed25519 -C "pc-dev"
```

Aceptar ruta por defecto:

```
C:\Users\TU_USUARIO\.ssh\id_ed25519
```

Archivos creados:

```
id_ed25519        (privada)
id_ed25519.pub    (pública)
```

---

## 4. Añadir clave pública al servidor

**Qué hacemos:** copiamos la clave pública al servidor dentro de `authorized_keys`.  
**Por qué:** esto permite autenticarte sin usar contraseña, usando tu clave.

Mostrar clave:

```powershell
cat ~/.ssh/id_ed25519.pub
```

En el servidor:

```bash
nano ~/.ssh/authorized_keys
```

Pegar la clave.

Permisos:

```bash
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
```

---

## 5. Activar ssh-agent en Windows

**Qué hacemos:** activamos el servicio que mantiene las claves SSH en memoria.  
**Por qué:** evita que tengas que escribir la passphrase cada vez que te conectas.

Abrir PowerShell **como administrador**:

```powershell
Get-Service ssh-agent | Set-Service -StartupType Automatic
Start-Service ssh-agent
```

Verificar:

```powershell
Get-Service ssh-agent
```

Debe aparecer `Running`.

---

## 6. Permitir ejecución de scripts PowerShell

**Qué hacemos:** cambiamos la política de ejecución para que podamos usar scripts `.ps1`.  
**Por qué:** por seguridad, Windows bloquea los scripts por defecto.

```powershell
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Responder:

```
Y
```

---

## 7. Crear script automático de carga de clave

**Qué hacemos:** escribimos un script que carga automáticamente nuestra clave en `ssh-agent` al abrir terminal.  
**Por qué:** automatiza la autenticación y evita escribir la passphrase cada vez.

Crear:

```
C:\Users\TU_USUARIO\.scripts\load-ssh-key.ps1
```

Contenido:

```powershell
# Asegura que ssh-agent esté activo
Get-Service ssh-agent | Set-Service -StartupType Automatic
Start-Service ssh-agent

# Ruta de la clave
$keyPath = "$env:USERPROFILE\.ssh\id_ed25519"

# Añadir clave solo si no está cargada
$loaded = ssh-add -l 2>$null
if ($loaded -notmatch "id_ed25519") {
    ssh-add $keyPath
}
```

Ejecutar:

```powershell
.\load-ssh-key.ps1
```

Verificar:

```powershell
ssh-add -l
```

---

## 8. Configurar SSH config

**Qué hacemos:** creamos alias y configuraciones en `~/.ssh/config`.  
**Por qué:** permite usar comandos simples (`ssh example`) y ejecutar `cloudflared` automáticamente.

Ejemplo:

```ssh
Host example
    HostName ssh.example.es
    User user
    ProxyCommand cloudflared access ssh --hostname %h
    IdentityFile ~/.ssh/id_ed25519
```

---

## 9. Login en Cloudflare Zero Trust

**Qué hacemos:** autenticamos nuestro PC en Cloudflare Zero Trust.  
**Por qué:** Cloudflare valida la identidad y genera un token de sesión seguro.

```powershell
cloudflared access login https://ssh.example.es
```

Se abrirá el navegador para autenticación.
![Editar variables de entorno del sistema](/assets/img/tutoriales/cloudflare-ssh-vscode/cloudflaredAcces.png)![Editar variables de entorno del sistema](/assets/img/tutoriales/cloudflare-ssh-vscode/cloudflaredCodeAccess.png)![Editar variables de entorno del sistema](/assets/img/tutoriales/cloudflare-ssh-vscode/cloudflaredAccessRequested.png)![Editar variables de entorno del sistema](/assets/img/tutoriales/cloudflare-ssh-vscode/cloudflaredAccessSuccess.png) 


---

## 10. Primera conexión SSH

**Qué hacemos:** conectamos al servidor por primera vez.  
**Por qué:** SSH necesita registrar la huella del servidor para futuras conexiones.

```powershell
ssh example
```

Aceptar fingerprint escribiendo:

```
yes
```

---

## 11. Verificación en modo debug

**Qué hacemos:** ejecutamos SSH en modo verbose.  
**Por qué:** permite ver si la clave se usa correctamente y si Cloudflare está proxying bien.

```powershell
ssh -vvv example
```

Debe aparecer:

```
Offering public key: id_ed25519
Server accepts key
Authenticated
```

---

## 12. Uso con VS Code

**Qué hacemos:** conectamos VS Code al servidor usando Remote SSH.  
**Por qué:** VS Code aprovechará la misma configuración SSH y cloudflared automáticamente.

1. Instalar extensión **Remote - SSH**
2. Abrir:

```
Connect to Host...
```

3. Elegir:

```
example
```

VS Code reutilizará la configuración SSH automáticamente.

---

## Resultado final

Flujo completo:

```
VS Code
   ↓
SSH
   ↓
cloudflared
   ↓
Cloudflare Zero Trust
   ↓
Servidor SSH
```

Con:

- autenticación por clave
- Zero Trust
- sin contraseñas repetidas
- conexión segura

---

## Troubleshooting rápido

- **cloudflared no reconocido:** revisar PATH y reiniciar terminal.  
- **Script bloqueado:** `Set-ExecutionPolicy RemoteSigned -Scope CurrentUser`  
- **Clave no usada:** `ssh-add -l`  

---

## Estado final esperado

- `ssh-agent` activo  
- clave cargada automáticamente  
- conexión SSH instantánea  
- VS Code funcionando sin prompts  

---

Fin del tutorial.

