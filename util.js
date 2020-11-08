const urlMetadata = require("url-metadata");

const returnMetaData = async (url, key) => {
  const ret = await urlMetadata(url);
  if (key) {
    return ret[key];
  } else {
    return ret;
  }
};

module.exports = { returnMetaData };
