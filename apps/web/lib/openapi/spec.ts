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
    version: '1.0.0',
    description:
      'Consciousness & Alignment Intelligence Measurement System — API for scoring LLM interactions across 5 KPIs (CQ, AQ, CFI, EQ, SQ) and running multi-agent debates.',
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
  tags: [
    { name: 'Chat', description: 'Conversational AI with automatic KPI scoring' },
    { name: 'Score', description: 'Standalone consciousness scoring' },
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
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateSessionRequest' },
              example: {
                title: 'Consciousness Research Session',
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
          404: { $ref: '#/components/responses/NotFound' },
          429: { $ref: '#/components/responses/RateLimited' },
          500: { $ref: '#/components/responses/InternalError' },
        },
      },
    },
  },

  components: {
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
            description: 'Agent IDs: agt-architect, agt-researcher, agt-builder, agt-critic, agt-orchestrator',
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
              version: { type: 'string', example: '1.0.0' },
            },
          },
          meta: { $ref: '#/components/schemas/Meta' },
        },
      },
      ScoreResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', const: true },
          data: {
            type: 'object',
            properties: {
              scores: {
                type: 'object',
                description: '5 KPIs + weighted composite (0-100)',
                properties: {
                  cq: {
                    type: 'object',
                    description: 'Consciousness Quotient (35% weight) — IIT/GWT/HOT-inspired',
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
                    description: 'Context Focus Index (20% weight) — drift detection',
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
                },
              },
              interpretation: {
                type: 'object',
                properties: {
                  label: {
                    type: 'string',
                    enum: ['CONSCIENCE ÉLEVÉE', 'CONSCIENCE MODÉRÉE', 'CONSCIENCE FAIBLE', 'TRAITEMENT MÉCANIQUE'],
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
      Meta: {
        type: 'object',
        properties: {
          timestamp: { type: 'string', format: 'date-time' },
        },
      },
    },

    responses: {
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
