# Cookie Dumper Server

Servidor mínimo en Flask que recibe cookies desde la extensión de Chrome y las guarda en disco en dos formatos:
1) Estructura de navegador tal cual la envía la extensión.
2) Formato de cabeceras HTTP listo para copiar/pegar.

## Requisitos
- Python 3.10+ (probado con 3.13)
- Dependencias: `flask`, `flask-cors`

## Instalación rápida
```bash
python -m venv venv
source venv/bin/activate        # En Windows: venv\Scripts\activate
pip install flask flask-cors
```

## Ejecución
```bash
python main.py --port 5000 --static-folder ./static
```
- `--port` (opcional): puerto HTTP.  
- `--static-folder` (opcional): ruta a assets estáticos para Flask.

## Endpoints (prefijo `/api`)

- `POST /api/cookie`  
  - Guarda las cookies en `cookies/cookie.json` preservando la estructura por dominio/nombre.
  - Payload esperado (ejemplo):
    ```json
    {
      "example.com": {
        "session": "abc123",
        "prefs": { "foo": "bar" }
      }
    }
    ```

- `POST /api/cookie-header`  
  - Convierte cada cookie a una cadena de cabecera y la guarda en `cookies/cookie_header.json`.
  - Cada entrada por dominio es una lista de cabeceras resultantes.
  - Payload esperado (ejemplo):
    ```json
    {
      "example.com": {
        "session": {
          "name": "session",
          "value": "abc123",
          "path": "/",
          "secure": true,
          "httpOnly": true,
          "sameSite": "Lax"
        }
      }
    }
    ```

## Respuestas
- Éxito: `{"status":"OK","saved":true}` con HTTP 200.
- Errores comunes:
  - 400: payload vacío o formato inválido.
  - 403: sin permisos de escritura.
  - 500: error inesperado al procesar o guardar.

## Archivos de salida
- `cookies/cookie.json`: cookies por dominio con la estructura original.
- `cookies/cookie_header.json`: lista de cabeceras generadas por dominio (`name=value; path=/; secure; HttpOnly; SameSite=Lax`).

## Notas
- El servidor permite CORS abiertos (`*`) para facilitar el envío desde la extensión.
- Si el archivo de destino ya existe, se fusiona el contenido por dominio conservando cookies previas.
