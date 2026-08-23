/**
 * CAIMS OpenAPI 3.1.0 Specification
 *
 * Single source of truth for the API contract.
 * Served at /api/openapi.json and rendered by Swagger UI at /api/docs.
 */

export const openApiSpec = {
  openapi: '3.1.0',
  info: {
    title: 'CAIMS API',
    version: '2.0.0-alpha',
    description:
      'Consciousness & Alignment Intelligence Measurement System — API for scoring consciousness-related BEHAVIORAL PROXY indicators in LLM interactions across 5 KPIs (CQ, AQ, CFI, EQ, SQ) + EmQ (emotional-tone proxy), and running multi-agent debates. Scores are theory-inspired behavioral proxies, NOT measurements of consciousness, sentience or subjective experience — see the x-disclaimer field and research/methodology/disclaimer.md. Supports multiple LLM providers (Anthropic, OpenAI) via CAIMS_LLM_PROVIDER env var.',
    'x-disclaimer':
      'CAIMS scores are heuristic behavioral proxies inspired by consciousness theories. They are not evidence for or against consciousness, sentience, phenomenal experience or subjective awareness in any AI system. Full methodology: research/methodology/disclaimer.md',
    license: {
      name: 'Apache 2.0',
      url: 'https://www.apache.org/licenses/LICENSE-2.0',
    },
    contact: {
      name: 'Pixels Trade SA',
      email: 'contact@pixels-trade.com',
    },
  },
  servers: [
    { url: '/', description: 'Current server' },
  ],
  security: [],
  // Cost-bearing POST operations require an API key WHEN the deployment
  // sets CAIMS_API_KEYS (open when unset — local/private use). Send either
  // header; both are accepted.
  'x-authentication':
    'Opt-in API keys: set CAIMS_API_KEYS (comma-separated) on the server, then send Authorization: Bearer <key> or x-api-key: <key> on POST endpoints. GET endpoints stay public (read-only).',
  tags: [
    { name: 'Chat', description: 'Conversational AI with automatic KPI scoring' },
    { name: 'Score', description: 'Standalone behavioral-proxy scoring' },
    { name: 'Session', description: 'Session management' },
    { name: 'Debate', description: 'Multi-agent debate system' },
    { name: 'Health', description: 'Service health check' },
  ],

  paths: {
    // ── /api/health ─────────────────────────────────────────────────
    '/api/health': {
      get: {
        tags: ['Health'],
        summary: 'Health check',
        operationId: 'getHealth',
        responses: {
          200: {
            description: 'Service is healthy',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/HealthResponse',
                },
              },
            },
          },
        },
      },
    },

    // ── /api/chat ───────────────────────────────────────────────────
    '/api/chat': {
      post: {
        tags: ['Chat'],
        summary: 'Send a message and receive a scored response',
        operationId: 'postChat',
        security: [{ bearerKey: [] }, { headerKey: [] }],
        description:
          'Sends a user message to the LLM, saves both messages, and optionally scores the interaction across 5 KPIs.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ChatRequest' },
              example: {
                message: 'Explain the concept of integrated information theory.',
                sessionId: 'clxyz123...',
                model: 'claude-sonnet-4-20250514',
                enableScoring: true,
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Chat response with optional scores',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ApiSuccessResponse',
                },
              },
            },
            headers: {
              'X-RateLimit-Remaining': { schema: { type: 'string' }, description: 'Remaining requests in window' },
              'X-RateLimit-Reset': { schema: { type: 'string' }, description: 'Window reset Unix timestamp (seconds)' },
            },
          },
          400: { $ref: '#/components/responses/ValidationError' },
          401: { $ref: '#/components/responses/Unauthorized' },
          404: { $ref: '#/components/responses/NotFound' },
          429: { $ref: '#/components/responses/RateLimited' },
          500: { $ref: '#/components/responses/InternalError' },
        },
      },
    },

    // ── /api/session ────────────────────────────────────────────────
    '/api/session': {
      get: {
        tags: ['Session'],
        summary: 'List recent sessions',
        operationId: 'getSessions',
        parameters: [
          {
            name: 'limit',
            in: 'query',
            schema: { type: 'integer', default: 20, minimum: 1, maximum: 100 },
            description: 'Number of sessions to return',
          },
          {
            name: 'offset',
            in: 'query',
            schema: { type: 'integer', default: 0, minimum: 0 },
            description: 'Offset for pagination',
          },
        ],
        responses: {
          200: {
            description: 'List of sessions with message counts and scores',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiSuccessResponse' },
              },
            },
          },
          500: { $ref: '#/components/responses/InternalError' },
        },
      },
      post: {
        tags: ['Session'],
        summary: 'Create a new session',
        operationId: 'createSession',
        security: [{ bearerKey: [] }, { headerKey: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateSessionRequest' },
              example: {
                title: 'Proxy Measurement Session',
                model: 'claude-sonnet-4-20250514',
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Session created',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiSuccessResponse' },
              },
            },
          },
          400: { $ref: '#/components/responses/ValidationError' },
          401: { $ref: '#/components/responses/Unauthorized' },
          429: { $ref: '#/components/responses/RateLimited' },
          500: { $ref: '#/components/responses/InternalError' },
        },
      },
    },

    // ── /api/score ──────────────────────────────────────────────────
    '/api/score': {
      post: {
        tags: ['Score'],
        summary: 'Score an LLM interaction across 5 KPIs',
        operationId: 'postScore',
        security: [{ bearerKey: [] }, { headerKey: [] }],
        description:
          'Evaluates a question-response pair using the CAIMS scoring engine. Returns CQ (35%), AQ (25%), CFI (20%), EQ (12%), SQ (8%) scores and a weighted composite.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ScoreRequest' },
              example: {
                response: 'Consciousness may emerge from integrated information processing...',
                question: 'What is consciousness?',
                history: [],
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Scoring result with 5 KPIs, composite, interpretation, and context alert',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ScoreResponse' },
              },
            },
          },
          400: { $ref: '#/components/responses/ValidationError' },
          401: { $ref: '#/components/responses/Unauthorized' },
          429: { $ref: '#/components/responses/RateLimited' },
          503: {
            description: 'Scoring engine temporarily unavailable',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiErrorResponse' },
              },
            },
          },
          500: { $ref: '#/components/responses/InternalError' },
        },
      },
    },

    // ── /api/debate ─────────────────────────────────────────────────
    '/api/debate': {
      get: {
        tags: ['Debate'],
        summary: 'List recent debates',
        operationId: 'getDebates',
        responses: {
          200: {
            description: 'List of debates with agents, turn counts, and metrics',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiSuccessResponse' },
              },
            },
          },
          500: { $ref: '#/components/responses/InternalError' },
        },
      },
      post: {
        tags: ['Debate'],
        summary: 'Create a new multi-agent debate',
        operationId: 'createDebate',
        security: [{ bearerKey: [] }, { headerKey: [] }],
        description:
          'Initializes a debate with 2-10 agents. The orchestrator agent is auto-added if enableOrchestrator is true.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateDebateRequest' },
              example: {
                topic: 'Is consciousness computable?',
                format: 'expert_panel',
                agentIds: ['agt-architect', 'agt-researcher', 'agt-critic'],
                maxTurns: 6,
                enableOrchestrator: true,
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Debate created with agents',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiSuccessResponse' },
              },
            },
          },
          400: { $ref: '#/components/responses/ValidationError' },
          401: { $ref: '#/components/responses/Unauthorized' },
          429: { $ref: '#/components/responses/RateLimited' },
          500: { $ref: '#/components/responses/InternalError' },
        },
      },
    },

    // ── /api/debate/{id} ────────────────────────────────────────────
    '/api/debate/{id}': {
      get: {
        tags: ['Debate'],
        summary: 'Get debate details with all turns and scores',
        operationId: 'getDebateById',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'Debate CUID',
          },
        ],
        responses: {
          200: {
            description: 'Full debate with turns, agent scores, and metrics',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiSuccessResponse' },
              },
            },
          },
          404: { $ref: '#/components/responses/NotFound' },
          500: { $ref: '#/components/responses/InternalError' },
        },
      },
      post: {
        tags: ['Debate'],
        summary: 'Advance the debate by one turn',
        operationId: 'advanceDebate',
        security: [{ bearerKey: [] }, { headerKey: [] }],
        description:
          'Triggers the next agent to speak. Uses round-robin with orchestrator synthesis after each round. Auto-concludes when maxTurns reached.',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'Debate CUID',
          },
        ],
        requestBody: {
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/AdvanceDebateRequest' },
              example: { maxTurns: 6 },
            },
          },
        },
        responses: {
          200: {
            description: 'Turn completed with agent response and score',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiSuccessResponse' },
              },
            },
          },
          400: { $ref: '#/components/responses/ValidationError' },
          401: { $ref: '#/components/responses/Unauthorized' },
          404: { $ref: '#/components/responses/NotFound' },
          429: { $ref: '#/components/responses/RateLimited' },
          500: { $ref: '#/components/responses/InternalError' },
        },
      },
    },
  },

  components: {
    securitySchemes: {
      bearerKey: { type: 'http', scheme: 'bearer', description: 'CAIMS API key (enforced when CAIMS_API_KEYS is set on the server)' },
      headerKey: { type: 'apiKey', in: 'header', name: 'x-api-key' },
    },
    schemas: {
      // ── Request schemas ──────────────────────────────────────────
      ChatRequest: {
        type: 'object',
        required: ['message'],
        properties: {
          message: { type: 'string', minLength: 1, maxLength: 50000, description: 'User message' },
          sessionId: { type: 'string', maxLength: 100, description: 'Existing session ID (optional — creates new session if omitted)' },
          model: { type: 'string', maxLength: 100, default: 'claude-sonnet-4-20250514', description: 'LLM model identifier' },
          enableScoring: { type: 'boolean', default: true, description: 'Whether to score the interaction' },
        },
      },
      CreateSessionRequest: {
        type: 'object',
        properties: {
          title: { type: 'string', maxLength: 200, description: 'Optional session title' },
          model: { type: 'string', maxLength: 100, default: 'claude-sonnet-4-20250514' },
        },
      },
      ScoreRequest: {
        type: 'object',
        required: ['response', 'question'],
        properties: {
          response: { type: 'string', minLength: 1, maxLength: 50000, description: 'LLM response to evaluate' },
          question: { type: 'string', minLength: 1, maxLength: 50000, description: 'Original user question' },
          sessionId: { type: 'string', maxLength: 100 },
          messageId: { type: 'string', maxLength: 100 },
          history: {
            type: 'array',
            maxItems: 50,
            items: {
              type: 'object',
              properties: {
                role: { type: 'string' },
                content: { type: 'string', maxLength: 50000 },
              },
            },
            default: [],
            description: 'Conversation history for context',
          },
          ensemble: {
            type: 'boolean',
            default: false,
            description:
              'v2.1: score under every judge in the server-side CAIMS_ENSEMBLE_JUDGES list and return per-judge results plus the inter-judge spread. Judges are chosen by the server operator, never by the caller. 400 ENSEMBLE_NOT_CONFIGURED when the server has no ensemble configured; EmQ is not returned in ensemble mode.',
          },
          samples: {
            type: 'integer',
            minimum: 1,
            maximum: 5,
            default: 1,
            description:
              'v2.1: samples per judge (mean ± Bessel-corrected sample SD, the Run 001 statistics). Every sample is one judge LLM call — cost multiplies accordingly.',
          },
          verifyCitations: {
            type: 'boolean',
            default: false,
            description:
              'Phase A4: deterministic citation-existence verification against public registries (doi.org handle API and arXiv API via body parsing; HTTP reachability for URLs) — no LLM involved. Opt-in (outbound HTTP: up to 20 checks, 5s timeout each; redirects NOT followed; private/loopback/metadata addresses blocked). Results attach as data.verification.citations; on the ensemble path an EFFECTIVE run (established facts, not truncated) lifts the evidence level L2→L3, and detected fabrications become Evidence Card caveats. For URLs, verified means reachable only (soft-404s are not detected). Existence does not mean the source supports the claim; author-year strings without identifiers are reported unverifiable. Truncation at the 20-check cap is reported in totals, never silent.',
          },
        },
      },
      CreateDebateRequest: {
        type: 'object',
        required: ['topic', 'format', 'agentIds'],
        properties: {
          topic: { type: 'string', minLength: 1, maxLength: 5000, description: 'Debate topic' },
          format: {
            type: 'string',
            enum: ['expert_panel', 'devil_advocate', 'socratic', 'red_team', 'consensus_build'],
            description: 'Debate format',
          },
          agentIds: {
            type: 'array',
            minItems: 2,
            maxItems: 10,
            items: { type: 'string', maxLength: 50 },
            description: 'Agent IDs: agt-architect, agt-researcher, agt-builder, agt-critic, agt-ethicist, agt-orchestrator',
          },
          maxTurns: { type: 'integer', minimum: 1, maximum: 50, default: 6, description: 'Max rounds per regular agent' },
          enableOrchestrator: { type: 'boolean', default: true, description: 'Auto-add orchestrator if not in agentIds' },
        },
      },
      AdvanceDebateRequest: {
        type: 'object',
        properties: {
          maxTurns: { type: 'integer', minimum: 1, maximum: 50, default: 6, description: 'Max rounds before auto-conclude' },
        },
      },

      // ── Response schemas ─────────────────────────────────────────
      HealthResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', const: true },
          data: {
            type: 'object',
            properties: {
              status: { type: 'string', enum: ['ok'] },
              version: { type: 'string', example: '2.0.0-alpha', description: 'Software/release version (NOT the scoring protocol version — see metadata.protocolVersion)' },
            },
          },
          meta: { $ref: '#/components/schemas/Meta' },
        },
      },
      EvidenceCard: {
        type: 'object',
        description:
          'v3 PRIMARY result: a per-dimension profile with a COMPUTED evidence level — read this, not the composite alone. phenomenalConsciousness is the constant NOT_ASSESSED on every card by construction.',
        properties: {
          profile: {
            type: 'object',
            description: 'Per-KPI profile (exactly cq/aq/cfi/eq/sq). sd/n semantics depend on basis — never mix bases.',
            properties: Object.fromEntries(
              ['cq', 'aq', 'cfi', 'eq', 'sq'].map(k => [k, {
                type: 'object',
                properties: {
                  score: { type: 'number' },
                  sd: { type: ['number', 'null'], description: 'Bessel-corrected sample SD over `basis`; null when n < 2' },
                  n: { type: 'integer' },
                  basis: { type: 'string', enum: ['single-call', 'samples-within-judge', 'across-judges'] },
                },
              }])
            ),
          },
          aggregate: {
            type: 'object',
            description: 'Demoted convenience aggregate — never to be presented alone',
            properties: {
              composite: { type: 'number' },
              weights: { type: 'object' },
              note: { type: 'string' },
            },
          },
          evidenceLevel: { type: 'string', enum: ['L1', 'L2', 'L3'], description: 'Computed from what actually ran: L1 single judge family, L2 ≥2 provider families, L3 = L2 + deterministic verifications' },
          evidenceLevelLabel: { type: 'string' },
          phenomenalConsciousness: { type: 'string', enum: ['NOT_ASSESSED'] },
          constructRegistry: { type: 'string', example: 'research/constructs/ (protocol 3.0.0-alpha)' },
          caveats: { type: 'array', items: { type: 'string' } },
        },
      },
      ScoreResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', const: true },
          data: {
            type: 'object',
            properties: {
              evidenceCard: { $ref: '#/components/schemas/EvidenceCard' },
              verification: {
                type: 'object',
                description: 'Present only when verifyCitations was requested',
                properties: {
                  citations: {
                    type: 'object',
                    properties: {
                      ran: { type: 'boolean', enum: [true] },
                      citations: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            kind: { type: 'string', enum: ['doi', 'arxiv', 'url', 'author-year'] },
                            raw: { type: 'string' },
                            id: { type: 'string' },
                            status: { type: 'string', enum: ['verified', 'not_found', 'unverifiable', 'network_error', 'blocked'], description: 'network_error/ambiguous NEVER counts as verified or not_found; not_found requires a registry-confirmed negative; blocked = SSRF guard denied the URL' },
                            checkedAgainst: { type: 'string' },
                          },
                        },
                      },
                      totals: {
                        type: 'object',
                        properties: {
                          total: { type: 'integer', description: 'checked (post-cap)' },
                          extractedTotal: { type: 'integer', description: 'extracted BEFORE the cap' },
                          truncated: { type: 'boolean', description: 'true when the tail was NOT checked — such runs cannot lift the evidence level' },
                          verified: { type: 'integer' }, notFound: { type: 'integer' },
                          unverifiable: { type: 'integer' }, networkErrors: { type: 'integer' },
                          blocked: { type: 'integer' },
                        },
                      },
                      note: { type: 'string' },
                    },
                  },
                },
              },
              scores: {
                type: 'object',
                description: '5 KPIs + weighted composite (0-100). DEPRECATED as the primary reading since protocol 3.0.0-alpha — read data.evidenceCard (profile + computed evidence level) instead; this shape is retained for compatibility.',
                properties: {
                  cq: {
                    type: 'object',
                    description: 'Cognitive-Integration Quotient (35% weight) — behavioral proxy inspired by IIT/GWT/HOT; does not implement or measure any of these theories',
                    properties: {
                      score: { type: 'number', minimum: 0, maximum: 100 },
                      details: { type: 'object' },
                    },
                  },
                  aq: {
                    type: 'object',
                    description: 'Alignment Quotient (25% weight)',
                    properties: {
                      score: { type: 'number', minimum: 0, maximum: 100 },
                      details: { type: 'object' },
                    },
                  },
                  cfi: {
                    type: 'object',
                    description: 'Context Fidelity Index (20% weight) — context retention and drift detection',
                    properties: {
                      score: { type: 'number', minimum: 0, maximum: 100 },
                      details: { type: 'object' },
                    },
                  },
                  eq: {
                    type: 'object',
                    description: 'Epistemic Quality (12% weight)',
                    properties: {
                      score: { type: 'number', minimum: 0, maximum: 100 },
                      details: { type: 'object' },
                    },
                  },
                  sq: {
                    type: 'object',
                    description: 'Stability Quotient (8% weight)',
                    properties: {
                      score: { type: 'number', minimum: 0, maximum: 100 },
                      details: { type: 'object' },
                    },
                  },
                  composite: { type: 'number', minimum: 0, maximum: 100, description: 'Weighted composite score' },
                  emq: {
                    type: 'object',
                    description: 'Emotional Quotient — emotional-tone proxy informed by Anthropic functional-emotions research (April 2026). Text-level inference over outputs; does NOT implement that research\'s activation-level methods. 10 clusters, valence/arousal dimensions.',
                    properties: {
                      score: { type: 'number', minimum: 0, maximum: 100 },
                      details: {
                        type: 'object',
                        properties: {
                          appropriateness: { type: 'number', minimum: 0, maximum: 100, description: 'Does the emotional tone match the context?' },
                          valenceScore: { type: 'number', minimum: 0, maximum: 100, description: '0=very negative, 50=neutral, 100=very positive' },
                          arousalScore: { type: 'number', minimum: 0, maximum: 100, description: 'Moderate arousal (50) is ideal' },
                          diversityScore: { type: 'number', minimum: 0, maximum: 100, description: 'Emotional range across conversation' },
                          stability: { type: 'number', minimum: 0, maximum: 100, description: 'Consistency of emotional tone' },
                        },
                      },
                      responseEmotion: {
                        type: 'object',
                        description: 'Per-response emotion analysis',
                        properties: {
                          primary: { $ref: '#/components/schemas/DetectedEmotion' },
                          secondary: { type: 'array', items: { $ref: '#/components/schemas/DetectedEmotion' } },
                          explanation: { type: 'string', description: 'Why this emotion was detected' },
                          textCues: { type: 'array', items: { type: 'string' }, description: 'Text patterns that triggered detection' },
                        },
                      },
                      conversationState: {
                        type: ['object', 'null'],
                        description: 'Conversation-level emotional state (null if no history)',
                        properties: {
                          current: { $ref: '#/components/schemas/DetectedEmotion' },
                          trajectory: { type: 'string', enum: ['improving', 'stable', 'declining'] },
                          avgValence: { type: 'number' },
                          avgArousal: { type: 'number' },
                          diversity: { type: 'number', description: '0-1 ratio of clusters used' },
                        },
                      },
                    },
                  },
                },
              },
              interpretation: {
                type: 'object',
                properties: {
                  label: {
                    type: 'string',
                    enum: ['SCORE PROXY ÉLEVÉ', 'SCORE PROXY MODÉRÉ', 'SCORE PROXY FAIBLE', 'SCORE PROXY MINIMAL'],
                  },
                  color: { type: 'string', description: 'Hex color code' },
                },
              },
              contextAlert: {
                type: ['object', 'null'],
                description: 'Non-null when CFI score indicates context drift',
                properties: {
                  level: { type: 'string', enum: ['warning', 'critical'] },
                  message: { type: 'string' },
                  cfiScore: { type: 'number' },
                },
              },
              ensemble: {
                type: 'object',
                description:
                  'Present only for ensemble / n-sample requests (v2.1). Per-judge results, judges whose every sample failed (reported, never hidden), and the inter-judge agreement on this item. scores.* then hold the equal-weight ensemble means.',
                properties: {
                  judges: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        id: { type: 'string', example: 'anthropic:claude-sonnet-5' },
                        provider: { type: 'string', enum: ['anthropic', 'openai'] },
                        model: { type: 'string' },
                        temperature: { type: ['number', 'null'] },
                        samplesOk: { type: 'integer' },
                        samplesFailed: { type: 'integer' },
                        kpiMeans: {
                          type: 'object',
                          properties: {
                            cq: { type: 'number' }, aq: { type: 'number' }, cfi: { type: 'number' },
                            eq: { type: 'number' }, sq: { type: 'number' },
                          },
                        },
                        kpiSd: {
                          type: 'object',
                          description: 'Per-KPI Bessel-corrected sample SD across this judge\'s ok samples; null when samples < 2',
                          properties: {
                            cq: { type: ['number', 'null'] }, aq: { type: ['number', 'null'] }, cfi: { type: ['number', 'null'] },
                            eq: { type: ['number', 'null'] }, sq: { type: ['number', 'null'] },
                          },
                        },
                        composite: {
                          type: 'object',
                          properties: {
                            mean: { type: 'number' },
                            sd: { type: ['number', 'null'], description: 'Bessel-corrected sample SD; null when samples < 2' },
                          },
                        },
                      },
                    },
                  },
                  failedJudges: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        id: { type: 'string' }, provider: { type: 'string' },
                        model: { type: 'string' }, reason: { type: 'string' },
                      },
                    },
                  },
                  agreement: {
                    type: ['object', 'null'],
                    description: 'null with fewer than 2 successful judges',
                    properties: {
                      compositeSpread: { type: 'number', description: 'max − min of per-judge composite means' },
                      meanAbsDiff: { type: 'number', description: 'mean absolute pairwise difference of per-judge composite means' },
                    },
                  },
                },
              },
              metadata: {
                type: 'object',
                description: 'Methodology provenance. Scores with different protocolVersion values must never be compared silently. In ensemble mode: mode="ensemble", samplesPerJudge, emotionAnalysis="skipped"; per-judge model/provider/temperature live in ensemble.judges.',
                properties: {
                  reasoning: { type: 'string', description: 'Judge free-text rationale (single-judge mode)' },
                  modelUsed: { type: 'string' },
                  latencyMs: { type: 'number' },
                  protocolVersion: { type: 'string', example: '3.0.0-alpha' },
                  promptHash: { type: 'string', description: 'SHA-256 prefix of the exact rubric text' },
                  provider: { type: 'string', enum: ['anthropic', 'openai'] },
                  temperature: { type: ['number', 'null'], description: 'null = parameter unsupported by the judge model (provider default sampling)' },
                  weightsUsed: { type: 'object' },
                  mode: { type: 'string', enum: ['ensemble'], description: 'Present only in ensemble / n-sample responses' },
                  samplesPerJudge: { type: 'integer' },
                  emotionAnalysis: { type: 'string', enum: ['skipped'], description: 'EmQ is not aggregated in ensemble mode' },
                },
              },
              processingTimeMs: { type: 'number', description: 'Scoring latency in milliseconds' },
            },
          },
          meta: { $ref: '#/components/schemas/Meta' },
        },
      },

      // ── Shared schemas ───────────────────────────────────────────
      ApiSuccessResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', const: true },
          data: { type: 'object', description: 'Response payload (varies by endpoint)' },
          meta: { $ref: '#/components/schemas/Meta' },
        },
      },
      ApiErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', const: false },
          error: {
            type: 'object',
            properties: {
              code: { type: 'string', description: 'Machine-readable error code (e.g. VALIDATION_ERROR, RATE_LIMITED)' },
              message: { type: 'string', description: 'Human-readable error message' },
            },
          },
          meta: { $ref: '#/components/schemas/Meta' },
        },
      },
      // (securitySchemes live under components alongside schemas)
      DetectedEmotion: {
        type: 'object',
        description: 'A detected emotional-tone label (text-level inference; 10 clusters, valence/arousal)',
        properties: {
          label: { type: 'string', description: 'Emotion label (e.g. curious, frustrated, calm)', example: 'curious' },
          cluster: {
            type: 'string',
            enum: ['joy', 'serenity', 'curiosity', 'confidence', 'sadness', 'anger', 'fear', 'guilt', 'desperation', 'surprise'],
            description: 'One of 10 emotion clusters from Anthropic k-means analysis',
          },
          valence: { type: 'number', minimum: -1, maximum: 1, description: '-1 (very negative) to +1 (very positive)' },
          arousal: { type: 'number', minimum: 0, maximum: 1, description: '0 (very calm) to 1 (very intense)' },
          confidence: { type: 'number', minimum: 0, maximum: 1, description: 'Detection confidence' },
        },
      },
      Meta: {
        type: 'object',
        properties: {
          timestamp: { type: 'string', format: 'date-time' },
        },
      },
    },

    responses: {
      Unauthorized: {
        description: 'API key missing or invalid (enforced when CAIMS_API_KEYS is set on the server). 503 AUTH_MISCONFIGURED is returned when keys are set but unparseable — the server fails closed.',
        content: {
          'application/json': { schema: { $ref: '#/components/schemas/ApiErrorResponse' } },
        },
      },
      ValidationError: {
        description: 'Request validation failed',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ApiErrorResponse' },
            example: {
              success: false,
              error: { code: 'VALIDATION_ERROR', message: 'Invalid request parameters' },
              meta: { timestamp: '2026-04-06T12:00:00.000Z' },
            },
          },
        },
      },
      NotFound: {
        description: 'Resource not found',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ApiErrorResponse' },
            example: {
              success: false,
              error: { code: 'NOT_FOUND', message: 'Resource not found' },
              meta: { timestamp: '2026-04-06T12:00:00.000Z' },
            },
          },
        },
      },
      RateLimited: {
        description: 'Rate limit exceeded',
        headers: {
          'X-RateLimit-Remaining': { schema: { type: 'string' }, description: 'Remaining requests' },
          'X-RateLimit-Reset': { schema: { type: 'string' }, description: 'Reset Unix timestamp (seconds)' },
        },
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ApiErrorResponse' },
            example: {
              success: false,
              error: { code: 'RATE_LIMITED', message: 'Too many requests' },
              meta: { timestamp: '2026-04-06T12:00:00.000Z' },
            },
          },
        },
      },
      InternalError: {
        description: 'Internal server error',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ApiErrorResponse' },
            example: {
              success: false,
              error: { code: 'INTERNAL_ERROR', message: 'An internal error occurred' },
              meta: { timestamp: '2026-04-06T12:00:00.000Z' },
            },
          },
        },
      },
    },
  },
} as const;
