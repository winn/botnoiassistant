export const mockApiResponses = {
  success: {
    status: 200,
    data: { message: 'Success' }
  },
  error: {
    status: 400,
    data: { message: 'Error' }
  },
  unauthorized: {
    status: 401,
    data: { message: 'Unauthorized' }
  },
  notFound: {
    status: 404,
    data: { message: 'Not found' }
  }
};

export const mockStreamResponse = {
  status: 200,
  body: new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      const chunks = [
        'Hello',
        ' ',
        'world',
        '!'
      ];

      let i = 0;
      const interval = setInterval(() => {
        if (i >= chunks.length) {
          clearInterval(interval);
          controller.close();
          return;
        }
        controller.enqueue(encoder.encode(chunks[i]));
        i++;
      }, 100);
    }
  })
};