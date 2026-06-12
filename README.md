# TaskMesh

A distributed workflow orchestration engine inspired by systems like Apache Airflow and Temporal. TaskMesh executes DAG-based workflows using a custom-built scheduler, worker orchestration layer, lease-based fault recovery, and priority-aware job scheduling — without relying on external queueing frameworks such as BullMQ, Celery, or Redis.

## Features

* DAG (Directed Acyclic Graph) workflow execution
* Custom scheduler built from scratch using Min Heap and Max Heap
* Delayed job scheduling and priority-based execution
* Worker registration and capacity-aware task assignment
* Lease-based job ownership and recovery
* Heartbeat monitoring and dead-worker detection
* Exponential backoff retry mechanism
* Automatic job reassignment and fault recovery
* Workflow dependency management and dynamic task triggering
* Real-time monitoring dashboard

---

## Architecture

```text
                    ┌─────────────┐
                    │   React UI  │
                    └──────┬──────┘
                           │
                           ▼
                 ┌───────────────────┐
                 │  Scheduler API    │
                 │ Node.js + Express │
                 └──────┬────────────┘
                        │
         ┌──────────────┼──────────────┐
         ▼                              ▼
 ┌───────────────┐             ┌────────────────┐
 │ Delay Queue   │             │ Ready Queue    │
 │   Min Heap    │             │   Max Heap     │
 └───────────────┘             └────────────────┘
                                          │
                                          ▼
                            ┌────────────────────────┐
                            │ Worker Orchestration   │
                            └───────────┬────────────┘
                                        │
                       ┌────────────────┴───────────────┐
                       ▼                                ▼
                Worker Instance 1               Worker Instance N

                        │
                        ▼
                  MongoDB Persistence
```

---

## Tech Stack

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose

### Frontend

* React.js
* Tailwind CSS
* Axios

## Core Components

### Scheduler Engine

TaskMesh maintains two custom scheduling queues:

#### Delay Queue (Min Heap)

Stores jobs waiting for their scheduled execution time.

#### Ready Queue (Max Heap)

Stores jobs ready to execute, ordered by priority.

### Workflow Engine

* DAG validation
* Cycle detection
* Topological sorting
* Dependency tracking
* Dynamic downstream task triggering

### Worker Orchestration

Workers:

* Register with the scheduler
* Send periodic heartbeats
* Poll for assignments
* Renew execution leases
* Report completion or failure

### Fault Recovery

TaskMesh handles:

* Worker crashes
* Lease expiration
* Retry scheduling
* Dead-worker detection
* Workflow failure propagation

---

## Job Lifecycle

```text
PENDING
   │
   ▼
READY
   │
   ▼
RUNNING
   │
   ├──► COMPLETED
   │
   └──► RETRYING ──► READY
                    │
                    ▼
                  FAILED
```

---

## Workflow Lifecycle

```text
Node A
   │
   ▼
Node B ─────┐
            ▼
Node C ──► Node D
```

A child node becomes eligible for execution only when all parent nodes have completed successfully.

---

## Running Locally

### Clone Repository

```bash
git clone <repo-url>
cd TaskMesh
```


Services:

| Service | Port  |
| ------- | ----- |
| MongoDB | 27017 |
| API     | 3000  |
| UI      | 5173  |

---

## API Endpoints

### Jobs

```http
POST   /api/jobs
GET    /api/jobs
GET    /api/jobs/:jobId
PATCH  /api/jobs/:jobId
DELETE /api/jobs/:jobId
POST   /api/jobs/:jobId/cancel
```

### Workers

```http
POST   /api/workers/register
POST   /api/workers/heartbeat
GET    /api/workers
GET    /api/workers/:workerId
GET    /api/workers/:workerId/assignments
```

### Workflows

```http
POST   /api/workflows
GET    /api/workflows
GET    /api/workflows/:workflowId
DELETE /api/workflows/:workflowId
```

---

## Key Learnings

This project was built to understand the internal mechanisms behind workflow orchestration systems such as Apache Airflow, Temporal, Celery, and BullMQ by implementing:

* Heap-based scheduling
* DAG execution engines
* Worker orchestration
* Lease-based execution ownership
* Failure recovery mechanisms
* Distributed task execution
* Capacity-aware scheduling

without relying on external queueing frameworks.

---
