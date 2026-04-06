import { openApiSpec } from '../spec';

describe('OpenAPI Specification', () => {
  it('uses OpenAPI 3.1.0', () => {
    expect(openApiSpec.openapi).toBe('3.1.0');
  });

  it('has correct API title and version', () => {
    expect(openApiSpec.info.title).toBe('CAIMS API');
    expect(openApiSpec.info.version).toBe('1.0.0');
  });

  it('has Apache 2.0 license', () => {
    expect(openApiSpec.info.license.name).toBe('Apache 2.0');
  });

  it('defines all 6 API paths', () => {
    const paths = Object.keys(openApiSpec.paths);
    expect(paths).toContain('/api/health');
    expect(paths).toContain('/api/chat');
    expect(paths).toContain('/api/session');
    expect(paths).toContain('/api/score');
    expect(paths).toContain('/api/debate');
    expect(paths).toContain('/api/debate/{id}');
    expect(paths).toHaveLength(6);
  });

  it('defines all 5 tags', () => {
    const tagNames = openApiSpec.tags.map(t => t.name);
    expect(tagNames).toContain('Chat');
    expect(tagNames).toContain('Score');
    expect(tagNames).toContain('Session');
    expect(tagNames).toContain('Debate');
    expect(tagNames).toContain('Health');
  });

  it('every path has at least one HTTP method', () => {
    for (const [, methods] of Object.entries(openApiSpec.paths)) {
      const httpMethods = Object.keys(methods);
      expect(httpMethods.length).toBeGreaterThan(0);
      for (const method of httpMethods) {
        expect(['get', 'post', 'put', 'patch', 'delete']).toContain(method);
      }
      // Verify each operation has responses
      for (const method of httpMethods) {
        const op = (methods as Record<string, { responses: unknown }>)[method];
        expect(op.responses).toBeDefined();
        expect(Object.keys(op.responses).length).toBeGreaterThan(0);
      }
    }
  });

  it('all POST endpoints document 400 and 429 responses', () => {
    for (const [, methods] of Object.entries(openApiSpec.paths)) {
      const post = (methods as Record<string, { responses: Record<string, unknown> }>).post;
      if (!post) continue;
      expect(post.responses['400']).toBeDefined();
      expect(post.responses['429']).toBeDefined();
    }
  });

  it('all POST endpoints have a requestBody', () => {
    for (const [path, methods] of Object.entries(openApiSpec.paths)) {
      const post = (methods as Record<string, { requestBody?: unknown }>).post;
      if (!post) continue;
      // /api/debate/{id} POST has optional body
      if (path === '/api/debate/{id}') continue;
      expect(post.requestBody).toBeDefined();
    }
  });

  it('defines all required component schemas', () => {
    const schemas = Object.keys(openApiSpec.components.schemas);
    expect(schemas).toContain('ChatRequest');
    expect(schemas).toContain('ScoreRequest');
    expect(schemas).toContain('CreateDebateRequest');
    expect(schemas).toContain('CreateSessionRequest');
    expect(schemas).toContain('ApiSuccessResponse');
    expect(schemas).toContain('ApiErrorResponse');
    expect(schemas).toContain('ScoreResponse');
    expect(schemas).toContain('HealthResponse');
    expect(schemas).toContain('Meta');
  });

  it('defines all reusable error responses', () => {
    const responses = Object.keys(openApiSpec.components.responses);
    expect(responses).toContain('ValidationError');
    expect(responses).toContain('NotFound');
    expect(responses).toContain('RateLimited');
    expect(responses).toContain('InternalError');
  });

  it('ScoreRequest has correct required fields', () => {
    const schema = openApiSpec.components.schemas.ScoreRequest;
    expect(schema.required).toContain('response');
    expect(schema.required).toContain('question');
  });

  it('CreateDebateRequest has valid format enum', () => {
    const formatProp = openApiSpec.components.schemas.CreateDebateRequest.properties.format;
    expect(formatProp.enum).toEqual([
      'expert_panel', 'devil_advocate', 'socratic', 'red_team', 'consensus_build',
    ]);
  });

  it('ScoreResponse documents all 5 KPIs', () => {
    const scoreProps = openApiSpec.components.schemas.ScoreResponse.properties.data.properties.scores.properties;
    expect(scoreProps.cq).toBeDefined();
    expect(scoreProps.aq).toBeDefined();
    expect(scoreProps.cfi).toBeDefined();
    expect(scoreProps.eq).toBeDefined();
    expect(scoreProps.sq).toBeDefined();
    expect(scoreProps.composite).toBeDefined();
  });

  it('no $ref points to a non-existent schema', () => {
    const json = JSON.stringify(openApiSpec);
    const refs = json.match(/\$ref":"#\/components\/(schemas|responses)\/([^"]+)/g) || [];
    for (const ref of refs) {
      const match = ref.match(/\$ref":"#\/components\/(schemas|responses)\/(.+)/);
      if (!match) continue;
      const [, section, name] = match;
      const target = section === 'schemas'
        ? openApiSpec.components.schemas
        : openApiSpec.components.responses;
      expect((target as Record<string, unknown>)[name]).toBeDefined();
    }
  });
});
