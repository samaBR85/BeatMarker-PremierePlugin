module.exports = {
  URL,
  URLSearchParams,
  pathToFileURL: (p) => new URL('file:///' + p.replace(/\\/g, '/')),
  fileURLToPath: (u) => new URL(u).pathname.replace(/^\/([A-Za-z]:)/, '$1'),
};
