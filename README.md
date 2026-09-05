# OrderBridge AI Client (Local Database Agent)

## Introduction
**OrderBridge AI Client** is the secure, local database agent for the [OrderBridge_Ai](https://github.com/YoFi-0/OrderBridge_Ai) ecosystem. Designed specifically for B2B suppliers, this client-side script acts as a secure bridge between the supplier's local database (or ERP system) and the central AI server. 

It receives interpreted WhatsApp requests (such as stock checks, price inquiries, and order placements) from the AI server, queries the local database, and instantly returns the requested information—all without exposing the supplier's internal network to the outside world.

## Architecture
The system utilizes a **Decoupled Architecture** to ensure maximum security, privacy, and efficiency for the supplier:

1. **WhatsApp & AI Server ([OrderBridge_Ai](https://github.com/YoFi-0/OrderBridge_Ai)):** Handles the natural language processing, user intent recognition, WhatsApp API integration, and human handoff routing.
2. **WebSocket Connection (`src/index.ts`):** The client *initiates* a secure, persistent WebSocket connection to the AI Server. This outbound connection means the supplier **does not need to open any inbound ports, configure complex port forwarding, or expose their servers to the public internet**.
3. **Local Database Operations:** Once a standardized JSON payload is received from the server, the client processes the query against the local system and streams the exact result back. 

## Key Features
* 🔒 **Zero-Trust Security:** Operates entirely behind the supplier's firewall. It pulls requests via WebSockets rather than accepting incoming HTTP requests, acting as a strict gatekeeper for the local database.
* ⚡ **Real-Time Processing:** Ensures instant, bi-directional data flow so retailers get immediate replies on WhatsApp.
* 🔄 **Smart Data Synchronization (`src/DB/syncTableAlgo.ts`):** Features a flexible mapping algorithm designed to synchronize, format, and translate local database structures into the standardized format required by the central server.
* 🛠️ **Agnostic & Customizable (`src/productsData.ts`):** Currently includes a mock database for demonstration and testing purposes, but the architecture allows for seamless plug-and-play integration with any SQL, NoSQL, or legacy ERP system the supplier uses.

## Installation & Usage

### Prerequisites
* [Node.js](https://nodejs.org/) (v16 or higher recommended)
* `npm` or `yarn` package manager

### Setup Steps

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/YoFi-0/OrderBridge_Ai_Client.git](https://github.com/YoFi-0/OrderBridge_Ai_Client.git)
   cd OrderBridge_Ai_Client
1. install node lbs:
   ```bash
   yarn
1. run:
   ```bash
   yarn dev
