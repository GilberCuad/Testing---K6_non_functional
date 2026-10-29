# Pruebas de performance con k6 + Jenkins local (Docker)

Proyecto de práctica para aprender **k6** implementando las pruebas de performance
que habitualmente se hacen con JMeter, ejecutadas desde un **Jenkins local en Docker**.

> **App bajo prueba:** [QuickPizza](https://github.com/grafana/quickpizza), la app demo
> oficial de Grafana k6, corriendo **localmente en Docker**
> (`ghcr.io/grafana/quickpizza-local:latest`, puerto `3333`).
> Nunca se ejecutan pruebas de carga contra el servidor público de QuickPizza.

## Estado del proyecto

| Fase | Descripción | Estado |
|---|---|---|
| 0 | Diagnóstico del entorno y estructura | ✅ Hecha |
| 1 | Docker Compose con QuickPizza (red `perf-net`) | ✅ Hecha |
| 2 | Primer test (smoke) | ⏳ Pendiente |
| 3 | Plan de pruebas (`docs/plan-de-pruebas.md`) | ⏳ Pendiente |
| 4 | Implementación de los tests (load, stress, spike, soak) | ⏳ Pendiente |
| 5 | Jenkins en Docker | ⏳ Pendiente |
| 6 | Pipeline (`Jenkinsfile`) | ⏳ Pendiente |
| 7 | (Opcional) InfluxDB + Grafana | ⏳ Pendiente |
| 8 | Documentación final | ⏳ Pendiente |

## Requisitos

| Herramienta | Versión verificada | Notas |
|---|---|---|
| Windows 11 + WSL 2 | 10.0.26200 | Docker Desktop usa WSL 2 como backend |
| Docker Desktop | Docker 29.9.2 | Debe estar **abierto** para que el engine responda. Instalación por usuario (`%LOCALAPPDATA%\Programs\DockerDesktop`) |
| Docker Compose | v5.6.1 | Se invoca como `docker compose` (con espacio) |
| k6 | — | No hace falta instalarlo: se usa la imagen `grafana/k6` |

Comprobación rápida:

```powershell
docker --version
docker compose version
docker info   # si falla, Docker Desktop no está corriendo
```

## Estructura del proyecto

```text
K6/
├── docker-compose.yml   # (Fase 1) Orquesta todos los servicios en la red perf-net
├── docker/              # Dockerfiles y configuración propia de cada servicio
│                        #   (imagen custom de Jenkins, provisioning de Grafana, etc.)
├── k6/
│   ├── scripts/         # Un script por tipo de prueba: smoke, load, stress, spike, soak
│   ├── lib/             # Código reutilizable: autenticación, config, thresholds
│   └── data/            # Datos de prueba (JSON/CSV) leídos con SharedArray
├── jenkins/             # Jenkinsfile y configuración del pipeline
├── docs/                # Plan de pruebas, decisiones y guías
└── results/             # Salidas de cada ejecución (ignorado por git)
```

## Cómo ejecutar

### 1. Levantar la app bajo prueba (QuickPizza)

```powershell
docker compose up -d --wait   # espera hasta que QuickPizza responda en /ready
docker compose ps             # quickpizza-ready debe aparecer como (healthy)
```

- Navegador / Windows: <http://localhost:3333> (publicado solo en `127.0.0.1`).
- Desde otros contenedores (k6, Jenkins): `http://quickpizza:3333`, conectándolos a la red `perf-net`.
- La base de datos es SQLite **en memoria**: al recrear el contenedor se pierden usuarios y ratings.

Verificación rápida:

```powershell
curl.exe -s -o NUL -w "%{http_code}" http://localhost:3333/ready      # 200
docker run --rm --network perf-net curlimages/curl:8.11.1 -s http://quickpizza:3333/api/names
```

Parar todo:

```powershell
docker compose down
```

#### ¿Por qué existe `quickpizza-ready`?

La imagen de QuickPizza es *distroless* (sin shell ni curl), así que no puede llevar su propio
`healthcheck`. El servicio `quickpizza-ready` es un contenedor mínimo con curl que comprueba
`http://quickpizza:3333/ready` por la red `perf-net`; su estado `healthy` indica que la app está
lista. Esto permite usar `docker compose up --wait`.

Se irá completando fase a fase.
