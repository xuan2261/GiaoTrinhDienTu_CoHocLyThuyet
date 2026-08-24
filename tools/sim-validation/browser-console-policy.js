'use strict';

const GPU_READBACK_DIAGNOSTIC = /GL Driver Message .*GPU stall due to ReadPixels/;

function fatalConsoleMessage(type, text) {
  if (type !== 'warning' && type !== 'error') return null;
  const message = String(text || '');
  if (type === 'warning' && GPU_READBACK_DIAGNOSTIC.test(message)) return null;
  return `${type}: ${message}`;
}

module.exports = { fatalConsoleMessage };
