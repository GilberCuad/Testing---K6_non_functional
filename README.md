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
| 1 | Docker Compose con QuickPizza (red `perf-net`) | ⏳ Pendiente |
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
| Docker Desktop | Docker 27.4.0 | Debe estar **abierto** para que el engine responda |
| Docker Compose | v2.31.0 | Se invoca como `docker compose` (con espacio) |
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

Se irá completando fase a fase.
