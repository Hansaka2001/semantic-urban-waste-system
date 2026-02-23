# Smart Urban Waste Management System

A full-stack Semantic Web application designed to logically model and optimize city waste logistics through a centralized knowledge graph and dynamic web dashboard.

This project was developed for the **CM 4650 - Semantic Web & Ontological Modelling** module.

## 🌍 The Problem & Solution
**The Problem:** Traditional municipal waste collection relies on fixed, static routes. This frequently leads to overflowing bins, environmental hazards, or wasted trips to empty containers. There is often a severe lack of integrated data between street-level infrastructure, truck routing, and recycling facilities.

**The Solution:** By utilizing a centralized ontology, this "Smart City" system bridges those data silos. It allows for dynamic, real-time SPARQL queries that instantly identify critical logistical thresholds (e.g., routing alerts, capacity warnings).

## 🛠️ Technology Stack
* **Ontology Engineering:** Protégé, OWL, RDF
* **Logic & Validation:** HermiT Reasoner (Disjoint rules, Domain/Range restrictions)
* **Database / Backend:** Apache Jena Fuseki (SPARQL Endpoint)
* **Frontend Dashboard:** Vanilla JavaScript (Fetch API), HTML5, Tailwind CSS

## ✨ Key Features
1. **Semantic Knowledge Graph:** A strict class hierarchy (`Infrastructure`, `Vehicle`, `Waste`) mapping real-world instances like `Bin_001` and `Truck_A`.
2. **Decoupled Architecture:** A custom web UI that queries the semantic database asynchronously over HTTP.
3. **Dynamic Visualization:** Auto-generating tables for Class Hierarchies, Object/Data Properties, and Knowledge Graph Individuals.
4. **Operational SPARQL Queries:** Real-time data filtering, including alerts for bins exceeding 75% fill capacity and truck routing logistics.

## 🚀 How to Run Locally

### 1. Start the Backend (Apache Jena Fuseki)
1. Download and extract [Apache Jena Fuseki](https://jena.apache.org/download/).
2. Open your terminal in the Fuseki directory and run:
   ```bash
   java -jar fuseki-server.jar