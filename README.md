# 🌾 Digital Twin in Precision Agriculture  
**A Web-Based System for 3D Point Cloud Multi-Vegetative Index Visualization and Real-Time Sensor Data**

[**📄 Read the Paper**](https://doi.org/...) | [**🌐 View Demo**](https://berca.uv.es/viewer/demo/elpuig.html)

## 📌 About the Project

This repository contains the source code for the system presented in our paper:  
**"Digital Twin in Precision Agriculture: A Web-Based System for 3D Point Cloud Multi-Vegetative Index Visualization and Real-Time Sensor Data"**  
(Universitat de València, 2023)

The system introduces a comprehensive web platform to monitor agricultural fields using a geolocated digital twin, 3D point cloud visualization, and real-time sensor data integration.

## 🧠 Key Features

- **3D Point Cloud Viewer** based on [Potree](https://potree.org), aligned with OpenStreetMap for geographical context
- **Multi-Vegetative Index Visualization** (NDVI, CIV, etc.) with lazy-load toggling
- **Real-Time Sensor Integration** via REST API supporting XML, JSON, and CSV formats
- **Historical Sensor Analytics** with interactive Chart.js visualizations
- **Immersive First-Person View** developed in Three.js for field exploration
- **Efficient Data Handling** using Redis (for caching) and MongoDB (for storage)
- **Kubernetes Deployment** for scalability, autoscaling, and load balancing

## 🏗️ System Architecture

![System Architecture](figs/system-workflow.png)

The platform is composed of:
- A RESTful API (Node.js + Express)
- Potree-based 3D viewer
- Three.js-based first-person explorer
- MongoDB and Redis backend
- Kubernetes orchestration

## 🚀 Getting Started

### Prerequisites

- Node.js >= 16
- MongoDB
- Redis
- Kubernetes + Helm (for deployment)
- Docker

### Clone the Repository

```bash
git clone https://github.com/your-org/precision-agriculture-digital-twin.git
cd precision-agriculture-digital-twin
```

### Install Dependencies

```bash
npm install
```

### Configure Environment

Create a `.env` file based on `.env.example` with the correct MongoDB and Redis URIs.

### Run Development Server

```bash
npm run dev
```

### Build and Deploy (Docker)

```bash
docker build -t digital-twin-agriculture .
docker run -p 3000:3000 digital-twin-agriculture
```

### Kubernetes Deployment

Use the included Helm chart to deploy on your cluster:

```bash
helm install digital-twin ./helm-chart
```

## 📊 Sensor API Endpoints

- `GET /sensors` - Retrieve all sensors
- `GET /sensors/:id` - Sensor metadata
- `GET /real/sensors/:id` - Real-time data (via Redis cache)
- `POST /sensors` - Ingest data (XML, JSON, CSV supported)

## 🖥️ Visualizations

- Toggle between orthophoto, point cloud, and first-person views
- View NDVI/CIV with real-time and historical sensor overlays
- Interact with clickable sensor points
- Explore historical graphs via Chart.js

## 📚 Citation

If you use this codebase or system in your research, please cite our paper (not yet accepted):

```
@article{SalcedoNavarro2023DigitalTwin,
  title={Digital Twin in Precision Agriculture: A Web-Based System for 3D Point Cloud Multi-Vegetative Index Visualization and Real-Time Sensor Data},
  author={Salcedo-Navarro, Andoni and Montalban-Faet, Guillem and Segura-Garcia, Jaume and Garcia-Pineda, Miguel},
  journal={},
  doi={},
  year={2025},
  volume={00},
}
```

## 👥 Authors

- Andoni Salcedo-Navarro
- Guillem Montalban-Faet
- Jaume Segura-Garcia
- Miguel Garcia-Pineda

## 🧑‍🔬 Contact

For inquiries or collaboration opportunities:  
📧 jaume.segura@uv.es  
📧 miguel.garcia-pineda@uv.es
