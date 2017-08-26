module.exports = {
  query: {
    convertCase: null,
    repeatParams: true
  },

  request: {
    // optional function, will be called per backend request (prior to the call being made)
    // with the the `req` and the `params` as arguments
    customizer: null,
    body: {
      convertCase: null
    }
  },

  response: {
    body: {
      convertCase: null
    }
  },

  proxy: null
};

