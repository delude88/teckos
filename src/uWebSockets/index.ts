
export default () => {
  try {
    // eslint-disable-next-line global-require,import/no-dynamic-require
    const uws = require(`uws_${process.platform}_${process.arch}_${process.versions.modules}.node`);
    if (process.env.EXPERIMENTAL_FASTCALL) {
      process.nextTick = (f, ...args) => {
        Promise.resolve().then(() => {
          f(...args);
        });
      };
    }
    return uws;
  } catch (e) {
    throw new Error(`This version of µWS is not compatible with your Node.js build:\n\n${e.toString()}`);
  }
};

