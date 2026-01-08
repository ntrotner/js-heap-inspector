export const httpMethods = ['GET', 'POST', 'PUT'] as const;
export type HttpMethods = typeof httpMethods[number];
