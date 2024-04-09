const { ipcRenderer } = window.require('electron');

const _i = (type, args) => {
  for (let i in args) {
    if (typeof args[i] === 'object') {
      args[i] = JSON.stringify(args[i]);
    }
  }
  if (typeof args === 'object') args = args.join(' ');
  ipcRenderer.send('log', { type, message: args });
}

export function log(...args) {
  console.log(args);
  _i('log', args);
}

export function error(...args) {
  if (args.length === 1) args = String(args[0]);
  console.error(args);
  _i('error', args);
}

export function warn(...args) {
  if (args.length === 1) args = String(args[0]);
  console.warn(args);
  _i('warn', args);
}

export function info(...args) {
  if (args.length === 1) args = String(args[0]);
  console.info(args);
  _i('info', args);
}