# SENTINEL

### Autonomous SRE Agent with Distributed Episodic Memory

SENTINEL is an agentic Site Reliability Engineering platform designed to detect, investigate, and eventually remediate production incidents across AWS infrastructure.

Its core principle is simple:

> **An SRE agent that forgets every incident is forced to rediscover the same solution repeatedly. SENTINEL turns operational history into persistent, queryable memory.**

Instead of treating an LLM conversation as temporary context, SENTINEL stores operational experience as structured memory in CockroachDB and retrieves relevant historical incidents when new failures occur.

The system combines:

* Amazon Bedrock for semantic embedding generation
* CockroachDB for transactional and vector memory
* CockroachDB HNSW vector indexing for semantic retrieval
* AWS S3 for immutable audit artifacts
* Next.js for the operator control plane
* TypeScript/Node.js for backend orchestration
* CloudWatch-compatible incident ingestion
* A confidence-gated memory retrieval layer
* An eventual autonomous remediation and verification loop

---

## 1. Problem

Production incidents are repetitive.

The same classes of failures appear repeatedly:

* database latency
* connection pool exhaustion
* runaway queries
* failed deployments
* resource saturation
* dependency failures
* abnormal traffic
* configuration regressions

Traditional alerting systems detect these incidents, but the diagnostic process often starts from zero.

An engineer investigates the same symptoms, discovers the same root cause, applies the same remediation, and documents the same operational knowledge again.

LLM-based agents do not automatically solve this.

Without persistent memory, an agent may understand an incident during one execution and completely forget it during the next.

SENTINEL treats operational memory as a first-class infrastructure primitive.

---

## 2. Core Thesis

### Memory is not context. Memory is infrastructure.

SENTINEL separates incident processing into two layers:

```text
                PRODUCTION INCIDENT
                        |
                        v
                Incident Ingestion
                        |
                        v
                Amazon Bedrock
                        |
                        v
                 1536-D Embedding
                        |
                        v
             +----------------------+
             |     CockroachDB      |
             |                      |
             |  Transactional State |
             |  Vector Memory        |
             |  Incident History     |
             +----------+-----------+
                        |
                        v
                 HNSW Retrieval
                        |
                        v
              Historical Incident
                        |
                        v
              Confidence Evaluation
                        |
              +---------+---------+
              |                   |
           High Match          Low Match
              |                   |
              v                   v
       Memory-assisted       Full Diagnosis
          workflow             required
```

This allows historical operational experience to directly influence future incident response.

---

# 3. Architecture

```text
                           AWS
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│                     CloudWatch / Alerts                      │
│                              │                               │
│                              ▼                               │
│                    ┌─────────────────┐                       │
│                    │ Incident API    │                       │
│                    │ /api/ingest     │                       │
│                    └────────┬────────┘                       │
│                             │                                │
│                             ▼                                │
│                    ┌─────────────────┐                       │
│                    │   CockroachDB   │                       │
│                    │                 │                       │
│                    │ incidents       │                       │
│                    │ semantic_memory │                       │
│                    │                 │                       │
│                    │ VECTOR(1536)    │                       │
│                    │ HNSW            │                       │
│                    └────────┬────────┘                       │
│                             ▲                                │
│                             │                                │
│                    cosine similarity                         │
│                             │                                │
│                    ┌────────┴────────┐                       │
│                    │ Memory Service  │                       │
│                    │ /api/memory     │                       │
│                    └────────┬────────┘                       │
│                             │                                │
│                             ▼                                │
│                    ┌─────────────────┐                       │
│                    │ Amazon Bedrock  │                       │
│                    │ Titan Embedding │                       │
│                    │ G1 — 1536-D     │                       │
│                    └─────────────────┘                       │
│                                                              │
│                    ┌─────────────────┐                       │
│                    │      S3         │                       │
│                    │ Audit Receipts  │                       │
│                    └─────────────────┘                       │
│                                                              │
└──────────────────────────────────────────────────────────────┘

                           │
                           ▼

                 SENTINEL Control Plane
                       Next.js
```

Amazon Titan Embeddings G1 produces 1,536-dimensional embeddings, matching SENTINEL's `VECTOR(1536)` memory representation.

---

# 4. Memory Architecture

SENTINEL's memory layer is designed around operational experience rather than generic chat history.

## Episodic Memory

Stores individual historical incidents.

Example:

```text
Incident:
Database query latency spike

Symptoms:
QueryDuration > threshold
Connection saturation
Elevated transaction latency

Root Cause:
Runaway analytical query

Remediation:
Terminate offending query and throttle analytical workload
```

Each memory contains:

* incident ID
* symptom signature
* root cause
* remediation
* importance score
* embedding
* timestamp
* relationship to the originating incident

---

## Semantic Retrieval

When a new incident arrives:

```text
New incident
     |
     v
Amazon Bedrock
     |
     v
1536-D embedding
     |
     v
CockroachDB vector search
     |
     v
Nearest historical incidents
```

The retrieval layer calculates cosine similarity and returns the most relevant operational memory.

A high-confidence match can allow SENTINEL to bypass unnecessary diagnostic work.

---

# 5. Confidence-Gated Decision Making

SENTINEL does not blindly trust vector similarity.

Current policy:

```text
Similarity >= 0.92
        |
        v
High-confidence memory match
        |
        v
Memory-assisted diagnostic bypass
```

Below the threshold:

```text
Similarity < 0.92
        |
        v
Do not autonomously bypass diagnosis
        |
        v
Full diagnostic workflow
```

This prevents semantic retrieval from becoming an uncontrolled automation mechanism.

The threshold is configurable and should ultimately be calibrated using an evaluation dataset rather than chosen arbitrarily.

---

# 6. CockroachDB as the Memory System of Record

CockroachDB is not being used merely as a generic relational database.

SENTINEL keeps:

* incident state
* structured operational memory
* vector embeddings
* retrieval metadata

inside the same distributed database.

This avoids maintaining a separate vector database and synchronizing operational records with embeddings.

CockroachDB specifically positions its AI architecture around combining transactional and vector workloads in one system.

### Memory schema

```sql
semantic_memory
├── id
├── incident_id
├── symptom_signature
├── root_cause
├── remediation_summary
├── incident_embedding VECTOR(1536)
├── importance_score
└── created_at
```

The vector index uses cosine distance for semantic retrieval.

---

# 7. AWS Integration

## Amazon Bedrock

SENTINEL uses Amazon Bedrock for embedding generation.

Current embedding model:

```text
amazon.titan-embed-text-v1
```

Output:

```text
1536-dimensional floating-point vector
```

AWS documents Titan Embeddings G1 as a 1,536-dimensional embedding model.

---

## Amazon S3

SENTINEL stores audit receipts in S3.

Example:

```text
audits/
└── memory-retrieval/
    └── <timestamp>.json
```

An audit receipt records:

* incident input
* retrieved memory
* similarity score
* confidence threshold
* agent decision
* embedding model
* embedding dimensions
* selected remediation

This provides an external record of agent decisions.

---

# 8. CockroachDB Agent Tooling

SENTINEL is designed around CockroachDB's agent-ready ecosystem.

### Managed MCP Server

The CockroachDB Managed MCP Server provides an agent-accessible interface to CockroachDB Cloud with authentication, RBAC enforcement, and auditability.

Planned usage:

```text
SENTINEL Agent
      |
      v
CockroachDB MCP
      |
      v
Database operations
```

This will allow the SRE agent to inspect database state and perform controlled operational actions.

### Agent Skills

CockroachDB Agent Skills provide machine-executable operational knowledge covering areas such as:

* query design
* operations
* performance
* security
* observability

These skills can provide the agent with database-specific diagnostic procedures instead of relying entirely on generic LLM reasoning.

### ccloud CLI

The ccloud CLI provides scriptable control-plane access for cluster operations and infrastructure workflows.

SENTINEL's production architecture can use this as a controlled operational interface where appropriate.

---

# 9. Incident Lifecycle

The intended lifecycle is:

```text
1. DETECT
     |
     v
2. INGEST
     |
     v
3. EMBED
     |
     v
4. RETRIEVE MEMORY
     |
     v
5. EVALUATE CONFIDENCE
     |
     +-------------------+
     |                   |
     v                   v
 HIGH CONFIDENCE      LOW CONFIDENCE
     |                   |
     v                   v
6. PLAN              FULL DIAGNOSIS
     |
     v
7. AUTHORIZE
     |
     v
8. EXECUTE
     |
     v
9. VERIFY
     |
     v
10. REFLECT
     |
     v
11. STORE NEW MEMORY
```

The final stages form the learning loop:

```text
Incident
   ↓
Decision
   ↓
Action
   ↓
Outcome
   ↓
Reflection
   ↓
Persistent Memory
   ↓
Better Future Response
```

---

# 10. Safety Model

Autonomous infrastructure operations cannot simply be:

```text
LLM → execute command
```

SENTINEL is designed around gated execution.

```text
Agent recommendation
        |
        v
Policy validation
        |
        v
Permission check
        |
        v
Risk classification
        |
        v
Execution
        |
        v
Verification
```

High-risk operations should require explicit human approval.

Low-risk, reversible operations may eventually be eligible for autonomous execution.

Every action should produce an auditable record.

---

# 11. Current Implementation

### Implemented

* [x] Next.js control plane
* [x] CloudWatch-compatible incident ingestion
* [x] Incident persistence in CockroachDB
* [x] Amazon Bedrock embedding generation
* [x] 1536-dimensional embedding validation
* [x] CockroachDB vector retrieval
* [x] HNSW vector indexing
* [x] Cosine similarity retrieval
* [x] Confidence threshold
* [x] Historical root-cause retrieval
* [x] Historical remediation retrieval
* [x] S3 audit receipts
* [x] Operator-facing incident terminal
* [x] Memory retrieval visualization
* [x] Database-backed incident ledger

### In Progress

* [ ] Real remediation executor
* [ ] MCP-based CockroachDB operations
* [ ] CockroachDB Agent Skills integration
* [ ] ccloud-based operational workflows
* [ ] Post-remediation verification
* [ ] Automated reflection
* [ ] Episodic memory write-back
* [ ] Multi-agent diagnostic workflow
* [ ] Human approval gates
* [ ] Production AWS deployment
* [ ] Distributed tracing
* [ ] Evaluation benchmark

**Important:** the current system retrieves and recommends historical remediation. Until the executor and verifier are implemented, SENTINEL should not claim that it autonomously remediates production incidents.

---

# 12. Repository Structure

```text
sentinel/
│
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── ingest/
│   │   │   │   └── route.ts
│   │   │   │
│   │   │   └── memory/
│   │   │       └── route.ts
│   │   │
│   │   ├── components/
│   │   │   └── LiveWarRoom.tsx
│   │   │
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   │
│   ├── lib/
│   │   └── db.ts
│   │
│   └── types/
│       └── database.ts
│
├── database/
│   ├── schema.sql
│   └── seed.sql
│
├── docs/
│   ├── architecture.md
│   ├── memory-model.md
│   └── security.md
│
├── .env.example
├── .gitignore
├── LICENSE
├── package.json
└── README.md
```

---

# 13. Environment Variables

Create `.env.local`:

```env
AWS_REGION=us-east-1

AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=

BEDROCK_EMBEDDING_MODEL_ID=amazon.titan-embed-text-v1

AWS_S3_BUCKET_NAME=

DATABASE_URL=
```

Never commit `.env.local`.

Use IAM roles instead of long-lived access keys for production AWS deployments.

---

# 14. Local Development

Install dependencies:

```bash
npm install
```

Start development:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

Trigger a test incident from the SENTINEL control plane.

The expected flow is:

```text
SEV-1 Alert
     ↓
Incident persisted
     ↓
Bedrock embedding generated
     ↓
1536-D vector created
     ↓
CockroachDB queried
     ↓
Historical memory retrieved
     ↓
Similarity evaluated
     ↓
Decision displayed
     ↓
Audit receipt written to S3
```

---

# 15. Production Design

The intended production deployment is:

```text
                    AWS
                     |
          ┌──────────┴──────────┐
          |                     |
       CloudWatch           Application
                                |
                         ┌──────┴──────┐
                         |             |
                      Next.js       Workers
                         |             |
                         └──────┬──────┘
                                |
                         Amazon Bedrock
                                |
                                v
                         CockroachDB
                                |
                 ┌──────────────┼──────────────┐
                 |              |              |
             Incidents      Vectors         Memory
                 |              |              |
                 └──────────────┼──────────────┘
                                |
                              HNSW
                                |
                                v
                         Agent Decision
                                |
                                v
                         Policy Engine
                                |
                                v
                           Executor
                                |
                                v
                           Verifier
                                |
                                v
                          Reflection
                                |
                                v
                        New Memory
```

---

# 16. Why CockroachDB?

SENTINEL requires a memory layer that can simultaneously handle:

1. transactional incident state,
2. structured operational memory,
3. vector similarity search,
4. distributed availability,
5. auditable database operations.

A separate relational database plus separate vector database introduces additional synchronization and consistency boundaries.

CockroachDB provides transactional and vector data capabilities in the same distributed database, while its current agent-ready ecosystem adds MCP, ccloud, and Agent Skills for AI-driven database interaction.

---

# 17. Evaluation

SENTINEL will be evaluated using measurable operational metrics.

### Retrieval Quality

```text
Recall@K
Precision@K
MRR
NDCG@K
```

### Incident Response

```text
Mean Time To Detect
Mean Time To Diagnose
Mean Time To Remediate
```

### Agent Quality

```text
Correct diagnosis rate
Correct remediation rate
False bypass rate
Unsafe action rate
Human escalation rate
```

### Memory Quality

```text
Memory retrieval latency
Embedding generation latency
Vector search latency
Memory write latency
```

The system should be benchmarked against a baseline agent without persistent memory.

---

# 18. Research Contribution

SENTINEL can be evaluated as a final-year engineering and research project around persistent agentic memory.

The central research question is:

> **Can persistent operational memory reduce diagnostic effort and improve incident-response reliability for autonomous SRE agents?**

The experiment compares:

```text
Baseline Agent
LLM + current incident
```

against:

```text
SENTINEL
LLM + current incident + persistent operational memory
```

The experiment measures whether historical memory improves:

* diagnostic accuracy
* retrieval efficiency
* response latency
* remediation accuracy
* unnecessary LLM reasoning
* incident recovery time

---

# 19. Security Principles

SENTINEL follows:

* least-privilege IAM
* environment-based secrets
* no credentials in source control
* confidence-gated automation
* explicit authorization for high-risk actions
* immutable audit artifacts
* database-level access control
* separation between recommendation and execution
* post-action verification
* human escalation for uncertain incidents

The system is designed so that **retrieval does not automatically imply authority to execute**.

---

# 20. Roadmap

### Phase 1 — Memory Foundation

* CockroachDB schema
* Bedrock embeddings
* vector retrieval
* incident persistence
* audit trail

### Phase 2 — Agent Reasoning

* diagnostic supervisor
* historical memory synthesis
* confidence calibration
* multi-step reasoning

### Phase 3 — Autonomous Operations

* remediation tools
* MCP integration
* policy engine
* execution sandbox
* human approval gates

### Phase 4 — Closed-Loop SRE

```text
Detect
  ↓
Diagnose
  ↓
Retrieve
  ↓
Plan
  ↓
Execute
  ↓
Verify
  ↓
Reflect
  ↓
Remember
```

### Phase 5 — Production Hardening

* multi-region deployment
* OpenTelemetry
* failure injection
* chaos testing
* load testing
* security testing
* CI/CD
* infrastructure as code
* disaster recovery
* formal evaluation

---

# 21. Competition Positioning

SENTINEL is not intended to be another chatbot with a vector database.

The core demonstration is:

```text
Incident A
   ↓
Agent solves it
   ↓
Outcome becomes persistent memory
   ↓
Incident B arrives
   ↓
Agent retrieves Incident A
   ↓
Diagnostic work is reduced
   ↓
Agent makes a faster decision
```

The value of CockroachDB is therefore fundamental to the architecture.

The database is not merely storing chat history.

It is the **operational memory system of record**.

---

# 22. License

This project is open source under the MIT License.

See:

```text
LICENSE
```

---

# 23. Status

SENTINEL is an active engineering and research project focused on persistent memory for autonomous SRE systems.

The project prioritizes:

```text
Correctness
   >
Observability
   >
Safety
   >
Autonomy
```

Autonomy is earned through measurable reliability—not simulated through UI animations.

---

## Built With

* Next.js
* TypeScript
* Amazon Bedrock
* AWS S3
* AWS CloudWatch
* CockroachDB Cloud
* CockroachDB Vector Indexing
* CockroachDB Managed MCP
* CockroachDB Agent Skills
* ccloud
* PostgreSQL-compatible SQL
* HNSW
* Vector similarity search



---

## Project Thesis

> **SENTINEL turns production incidents into persistent operational experience, allowing future agents to retrieve what previous agents learned instead of rediscovering the same failure from scratch.**
