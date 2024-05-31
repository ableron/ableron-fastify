import { describe, expect, it } from 'vitest';
import ableron from '../src';
import Fastify from 'fastify';
import request from 'supertest';

describe('Ableron Fastify Plugin', () => {
  it('should apply transclusion', async () => {
    // given
    const app = appWithAbleronPlugin();
    app.get('/', (request, reply) => {
      reply
        .type('text/html; charset=utf-8')
        .send(`<ableron-include src="${getFragmentBaseUrl(request)}/fragment">fallback</ableron-include>`);
    });
    app.get('/fragment', (request, reply) => {
      reply.type('text/html; charset=utf-8').send('fragment');
    });
    await app.ready();

    // when
    const response = await request(app.server).get('/');

    // then
    expect(response.headers['content-type']).toBe('text/html; charset=utf-8');
    expect(response.headers['content-length']).toBe(String('fragment'.length));
    expect(response.status).toBe(200);
    expect(response.text).toBe('fragment');
  });

  it('should check content-type text/html case insensitive', async () => {
    // given
    const app = appWithAbleronPlugin();
    app.get('/', (request, reply) => {
      reply
        .type('TEXT/HTML')
        .send(`<ableron-include src="${getFragmentBaseUrl(request)}/fragment">fallback</ableron-include>`);
    });
    app.get('/fragment', (request, reply) => {
      reply.type('TEXT/HTML; charset=utf-8').send('fragment');
    });
    await app.ready();

    // when
    const response = await request(app.server).get('/');

    // then
    expect(response.headers['content-type']).toBe('TEXT/HTML');
    expect(response.headers['content-length']).toBe(String('fragment'.length));
    expect(response.status).toBe(200);
    expect(response.text).toBe('fragment');
  });

  it('should skip transclusion when content-type is not text/html', async () => {
    // given
    const originalBody = `<ableron-include id="test">fallback</ableron-include>`;
    const app = appWithAbleronPlugin();
    app.get('/', (request, reply) => {
      reply.type('text/plain').send(originalBody);
    });
    await app.ready();

    // when
    const response = await request(app.server).get('/');

    // then
    expect(response.headers['content-type']).toBe('text/plain');
    expect(response.headers['content-length']).toBe(String(originalBody.length));
    expect(response.status).toBe(200);
    expect(response.text).toBe(originalBody);
  });

  it('should skip transclusion when status code is 3xx', async () => {
    // given
    const originalBody = `<ableron-include id="test">fallback</ableron-include>`;
    const app = appWithAbleronPlugin();
    app.get('/', (request, reply) => {
      reply.code(301).send(originalBody);
    });
    await app.ready();

    // when
    const response = await request(app.server).get('/');

    // then
    expect(response.headers['content-type']).toBe('text/plain; charset=utf-8');
    expect(response.headers['content-length']).toBe(String(originalBody.length));
    expect(response.status).toBe(301);
    expect(response.text).toBe(originalBody);
  });

  it('should handle multibyte characters', async () => {
    // given
    const app = appWithAbleronPlugin();
    app.get('/', (request, reply) => {
      reply.type('text/html; charset=utf-8').send(`<ableron-include id="test">☺</ableron-include>`);
    });
    await app.ready();

    // when
    const response = await request(app.server).get('/');

    // then
    expect(response.headers['content-type']).toBe('text/html; charset=utf-8');
    expect(response.headers['content-length']).toBe('3');
    expect(response.status).toBe(200);
    expect(response.text).toBe('☺');
  });

  it('should pass request headers to resolveIncludes()', async () => {
    // given
    const app = appWithAbleronPlugin();
    app.get('/', (request, reply) => {
      reply
        .type('text/html; charset=utf-8')
        .send(`<ableron-include src="${getFragmentBaseUrl(request)}/fragment">fallback</ableron-include>`);
    });
    app.get('/fragment', (request, reply) => {
      reply.type('text/html; charset=utf-8').send(request.headers['user-agent']);
    });
    await app.ready();

    // when
    const response = await request(app.server).get('/').set('User-Agent', 'test');

    // then
    expect(response.text).toBe('test');
  });

  function appWithAbleronPlugin() {
    const app = Fastify({ logger: true });
    app.register(ableron, {
      ableron: {
        logger: console
      }
    });
    return app;
  }

  function getFragmentBaseUrl(request): string {
    return request.protocol + '://' + request.hostname;
  }
});
