export function ok(result, message = '成功') {
  return {
    success: true,
    code: 200,
    message,
    result,
  };
}

export function fail(message, code = 500) {
  return {
    success: false,
    code,
    message,
    result: null,
  };
}

export function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
    },
  });
}
