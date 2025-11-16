// Shared mock data store - in a real app, this would be a database
export const mockProjectsStore: Record<
  string,
  {
    sessionID: string;
    id: string;
    name: string;
    nodeCount: number;
    updatedAt: string;
    response: string;
    userPrompt: string;
  }
> = {
  "1": {
    sessionID: "",
    id: "1",
    name: "Customer Query Analysis",
    nodeCount: 24,
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    userPrompt: "",
    response: `### Customer Query Analysis 💬

This project utilizes a sophisticated large language model (LLM) pipeline to **comprehensively analyze and categorize incoming customer service queries** that originate from a multitude of channels, including direct email, real-time chat logs, and public social media platforms. The central objective of this system is to transform unstructured, raw textual data into actionable, categorized information.

The core functionality involves a multi-stage NLP process. First, the system performs **tokenization and normalization** of the input text to ensure consistency. Following this, a specialized deep learning model identifies the primary **intent** behind the customer's communication. This intent classification can include detailed categories such as 'Billing Inquiry', 'Product Defect Report', 'Feature Request', 'Technical Support Needed', or 'General Feedback'.

Crucially, the next stage involves **Named Entity Recognition (NER)** to extract key, relevant **entities** from the query. These entities are essential for efficient resolution and typically include data points like the customer's account number, specific product name or SKU, reported error messages, timestamp of an issue, or the version of software being used.

The ultimate goal of the completed analysis is twofold:
1.  **Automated Routing:** Based on the classified intent and extracted entities, the system dynamically routes the query to the most appropriate internal department or specialist team for immediate resolution, significantly reducing internal transfer times.
2.  **Agent Augmentation:** For human-handled queries, the analysis automatically generates a suggested response template, highlights the most critical information, and provides a concise summary of the issue, enabling the support agent to respond faster and with greater accuracy.

The project's architecture, which currently consists of **24 active processing nodes**, is designed for high throughput and near-real-time processing capabilities, ensuring that support teams have up-to-the-minute insights into current customer pain points. The entire process is auditable, with a feedback loop designed to continuously improve the accuracy of the intent and entity recognition models based on agent performance and resolution success.

**Sample Text Content:**

"The Customer Query Analysis project, internally referenced as 'Project Hermes', has been operational for three months and has proven to be a pivotal component of our support infrastructure. With its robust architecture currently leveraging **24 active processing nodes** across three geographical regions, the system has successfully processed an extraordinary volume, exceeding **5,000 unique customer queries** within the last sixty minutes alone. This high-speed capability is vital for maintaining our Service Level Agreements (SLAs).

Recent operational metrics are highly insightful. The system has successfully identified a statistically significant **30% week-over-week increase** in queries classified under the 'Account Suspension' intent. This sharp rise is a critical warning signal, strongly suggesting a recent, systemic issue impacting our automated billing or anti-fraud protection mechanisms. This intelligence has immediately triggered an alert for the Engineering and Finance teams for root cause analysis.

A deeper dive into the data reveals the top entities consistently being extracted are 'Premium Subscription Tier' and the specific alphanumeric code 'Error Code 404B'. The correlation between the 'Account Suspension' intent and 'Error Code 404B' points directly to a bug in how that specific subscription tier interacts with our new payment gateway integration.

The project's classified and enriched output currently serves as the indispensable input for our global Level 1 Triage System. Since deployment, the model has consistently maintained an impressive **92% first-pass accuracy** rate in initial intent classification, dramatically reducing the mean time to resolution (MTTR) by an average of 15%. Furthermore, the model has demonstrated an $F_1$ score of **0.88** for entity extraction, proving its reliability in extracting critical customer data necessary for swift service recovery. The last update to this system's configuration and model weights was applied on **Updated at: $2025-11-15T15:20:19.000Z$**, highlighting its active maintenance schedule."`,
  },
  "2": {
    sessionID: "",
    id: "2",
    name: "Medical Diagnosis Review",
    nodeCount: 18,
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    userPrompt: "",
    response: `### Medical Diagnosis Review 🩺

This project is a critical application built on a machine learning framework designed for **pre-screening and review of complex medical diagnostic data**. Its primary function is to enhance the accuracy and efficiency of healthcare providers by offering a secondary, data-driven perspective on patient cases. The system ingests vast amounts of structured and unstructured data, including electronic health records (EHRs), lab results, radiological reports (processed via integrated computer vision models), and transcribed doctor's notes.

The model employs advanced **differential diagnosis algorithms** that compare the current patient's profile against a massive, anonymized database of historical successful treatments and known pathologies. It leverages **Natural Language Processing (NLP)** to understand the nuances in clinical documentation, converting complex medical terminology and syntaxes into quantifiable features. The system is designed not to replace the clinician but to act as an intelligent assistant, flagging potential inconsistencies, suggesting less common but relevant diagnoses, and highlighting critical risk factors that might be overlooked during a rapid review.

A core component is the **risk stratification module**, which uses predictive analytics to calculate the probability of specific outcomes (e.g., disease progression, adverse drug reactions) based on the current diagnostic status. This provides an objective, statistical basis for treatment planning. The system ensures high data privacy and compliance standards (e.g., HIPAA) and features a detailed **explainability layer**, allowing doctors to trace back the logical path and evidentiary sources the model used to arrive at its suggested review findings. The current iteration focuses heavily on complex oncology and rare autoimmune disorders.

**Sample Text Content:**

"The Medical Diagnosis Review project, designated 'Project Aesculapius', is an indispensable tool in our Clinical Decision Support (CDS) system, specifically targeted at reducing diagnostic error rates in high-stakes environments. The system currently operates with **18 dedicated processing nodes**, each tasked with handling concurrent case reviews, enabling the rapid processing of high-volume patient data streams.

In a recent stress test simulation, the model was fed 500 complex patient profiles for secondary review. The system successfully identified **three high-priority cases** where the primary diagnosis, initially assigned by human clinicians, was inconsistent with the historical patient outcome data in the training set. In one instance involving an autoimmune disorder, the model flagged a critical but subtle **elevated C-reactive protein (CRP)** level that, when cross-referenced with a specific genetic marker (entity: **HLA-B27**), pointed towards a highly aggressive, rare form of spondyloarthropathy, which was missed in the initial human review.

The system's **risk stratification score** for this specific cohort averaged a $\mu = 0.65$ probability of disease progression within six months if the initial, less aggressive treatment plan was followed. This statistical insight, driven by a rigorous deep learning architecture, prompted immediate revision of the treatment protocols for 15% of the reviewed cases.

The **18 nodes** are consistently processing an average of **200 patient records per hour**, with a mean review time of less than 15 minutes per case, which includes data ingestion, feature extraction, and output generation. The current training corpus encompasses over **1 million anonymized patient records** and is continuously updated to maintain a high level of clinical relevance and predictive power. This iteration of the project, last updated on **Updated at: $2025-11-14T17:20:36.000Z$**, is primarily focused on improving the $F_1$ score for differentiation between benign and malignant liver lesions in CT scans, aiming for a target score of $0.95$."`,
  },
  "3": {
    sessionID: "",
    id: "3",
    name: "Code Analysis Trace",
    nodeCount: 42,
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    userPrompt: "",
    response: `### Code Analysis Trace 💻

This project is a high-performance, dynamic analysis system designed for **tracing execution paths and identifying complex vulnerabilities** within large, proprietary codebases. Its core function is to systematically review application source code and its compiled binaries to understand its runtime behavior, going far beyond the capabilities of static analysis tools.

The system constructs a detailed **control-flow graph (CFG)** and **data-flow graph (DFG)** for the entire application, which includes dependencies, external library calls, and inter-process communication. By emulating execution and symbolically executing code segments, the project can trace the flow of specific **tainted data** (e.g., user input, external API responses) from its source to its sink (e.g., database query, file write, command execution). This is critical for discovering security flaws like **SQL Injection, Cross-Site Scripting (XSS), and Insecure Deserialization**.

Furthermore, the **Code Analysis Trace** system is equipped with an advanced **fuzzing module** that generates intelligent test cases based on the discovered execution paths. It monitors memory consumption, thread usage, and register state changes to detect subtle anomalies indicative of **buffer overflows, race conditions, and memory leaks**. The model outputs a comprehensive report, prioritizing flaws based on exploitability and impact, and provides precise source code location and a recommended remediation patch. The project's current focus is on deeply nested, asynchronous microservices written in Go and Rust.

**Sample Text Content:**

"The Code Analysis Trace system, known internally as 'Project Cerberus', represents our cutting-edge defense against zero-day exploits and deeply embedded logical flaws. With **42 high-utilization nodes** dedicated to parallel execution tracing, the system is engineered to handle massive, complex enterprise applications, performing a full trace on a 10-million-line codebase in under four hours.`
  },
  "1763294593331": {
    id: "1763294593331",
    name: "test payload",
    nodeCount: 0,
    updatedAt: "2025-11-16T12:03:13.331Z",
    userPrompt: "create the recipe for lemon chicken",
    sessionID: "84417e91-ef3e-4087-bec3-a5bbef55b9a7",
    response: ``,
  },
  "1763302081768": {
    id: "1763302081768",
    name: "new project",
    nodeCount: 0,
    updatedAt: "2025-11-16T14:08:01.768Z",
    userPrompt: "how do i cook fried rice",
    sessionID: "93876035-a207-4749-9918-3ede71a57bb4",
    response: ``,
  },
  "1763302289990": {
    id: "1763302289990",
    name: "new project -2",
    nodeCount: 0,
    updatedAt: "2025-11-16T14:11:29.990Z",
    userPrompt: "how do i cook steamed fish?",
    sessionID: "85a2cdeb-d4ee-4e80-97d6-fe7803e3a816",
    response: ``,
  },
  "1763303974381": {
    id: "1763303974381",
    name: "steamed chicken",
    nodeCount: 0,
    updatedAt: "2025-11-16T14:39:34.381Z",
    userPrompt: "how do i cook steamed chicken",
    sessionID: "16df97d5-84ac-4e65-8ca5-f5c0ee910a47",
    response: ``,
  },
  "1763304622101": {
    id: "1763304622101",
    name: "fried chciken",
    nodeCount: 0,
    updatedAt: "2025-11-16T14:50:22.101Z",
    userPrompt: "create a recipe for fried chicken",
    sessionID: "dc5e5864-aa48-4774-9854-80de42b340aa",
    response: ``,
  },
  "1763307431143": {
    id: "1763307431143",
    name: "test hack",
    nodeCount: 0,
    updatedAt: "2025-11-16T15:37:11.143Z",
    userPrompt: "how to cook chicken",
    sessionID: "b13f88cf-8d19-4256-b300-5510780fa75c",
    response: ``,
  },
  "1763307762945": {
    id: "1763307762945",
    name: "cook fish",
    nodeCount: 0,
    updatedAt: "2025-11-16T15:42:42.945Z",
    userPrompt: "how do i cook steamed fish",
    sessionID: "6ca1a5d2-4f82-4a23-a5c0-d1cf2acb2f4d",
    response: ``,
  },
  "1763308415456": {
    id: "1763308415456",
    name: "equity report",
    nodeCount: 0,
    updatedAt: "2025-11-16T15:53:35.456Z",
    userPrompt: "construct an equity research report",
    sessionID: "24d5513d-2e6b-4d89-8407-9e0053e56039",
    response: ``,
  },
  "1763308907505": {
    id: "1763308907505",
    name: "business report",
    nodeCount: 0,
    updatedAt: "2025-11-16T16:01:47.505Z",
    userPrompt: "construct a marketing plan for food business",
    sessionID: "ae924371-323b-4db1-88ac-acc8a7e39c83",
    response: ``,
  },
  "1763309378036": {
    id: "1763309378036",
    name: "cook duck",
    nodeCount: 0,
    updatedAt: "2025-11-16T16:09:38.036Z",
    userPrompt: "create recipe for braised peking duck",
    sessionID: "aed79dd7-491e-4b24-8be9-de05d90dc984",
    response: ``,
  },
};
