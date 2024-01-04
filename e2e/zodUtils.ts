import { z } from 'zod';

// Approximate shape of the agent response, not granular all the way
const agentResponseSchema = z.object({
  requestId: z.string(),
  browserName: z.string(),
  browserVersion: z.string(),
  confidence: z.object({
    score: z.number(),
  }),
  device: z.string(),
  firstSeenAt: z.object({
    global: z.string().nullable(),
    subscription: z.string().nullable(),
  }),
  incognito: z.boolean(),
  ip: z.string(),
  ipLocation: z.record(z.any()).optional(),
  lastSeenAt: z.object({
    global: z.string().nullable(),
    subscription: z.string().nullable(),
  }),
  meta: z
    .object({
      version: z.string(),
    })
    .optional(),
  os: z.string(),
  osVersion: z.string(),
  visitorFound: z.boolean(),
  visitorId: z.string(),
});

export function isAgentResponse(obj: unknown): boolean {
  try {
    agentResponseSchema.parse(obj);
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

// Approximate shape of the server response, not granular all the way
const serverResponseSchema = z.object({
  products: z.object({
    identification: z.object({
      data: z
        .object({
          visitorId: z.string(),
          requestId: z.string(),
          browserDetails: z.record(z.any()),
          incognito: z.boolean(),
          ip: z.string(),
          ipLocation: z.record(z.any()),
          timestamp: z.number(),
          time: z.string(),
          url: z.string(),
          tag: z.object({}),
          confidence: z.object({
            score: z.number(),
          }),
          visitorFound: z.boolean().optional(),
          firstSeenAt: z.object({
            global: z.string().nullable(),
            subscription: z.string().nullable(),
          }),
          lastSeenAt: z.object({
            global: z.string().nullable(),
            subscription: z.string().nullable(),
          }),
        })
        .optional(),
    }),
    botd: z.object({
      data: z.object({
        bot: z.object({
          result: z.string(),
        }),
        url: z.string(),
        ip: z.string(),
        time: z.string(),
        userAgent: z.string(),
        requestId: z.string(),
      }),
    }),
    rootApps: z.object({
      data: z.object({
        result: z.boolean(),
      }),
    }),
    emulator: z.object({
      data: z.object({
        result: z.boolean(),
      }),
    }),
  }),
});

export function isServerResponse(obj: unknown): boolean {
  try {
    serverResponseSchema.parse(obj);
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}
