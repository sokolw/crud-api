import { IncomingMessage } from 'http';

export const parseReqToJson = async (request: IncomingMessage) => {
  return await new Promise((resolve) => {
    request.setEncoding('utf-8');
    const chunks: Array<string> = [];
    request.on('data', (data) => {
      chunks.push(data);
    });
    request.on('end', () => {
      try {
        const result: unknown = JSON.parse(chunks.join(''));
        resolve(result);
      } catch {
        resolve(null);
      }
    });
  });
};
