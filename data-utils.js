const rokuMaster = require("./model/roku-master.json");

const getKeysFromMaster = () => {
  return Object.keys(rokuMaster);
};

const getChannelAndIdFromMaster = () => {
  return Object.entries(rokuMaster).reduce((acc, [name, metaData]) => {
    acc[metaData.displayName] = metaData.channelId;
    return acc;
  }, {});
};

const getChannelIdToContentListMap = () => {
  // Object.values
  return Object.entries(rokuMaster).reduce((acc, [name, metadata]) => {
    const x = metadata.content.reduce((acc, { title, contentId }) => {
      acc[title] = contentId;
      return acc;
    }, {});
    acc[metadata.channelId] = x;
    return acc;
  }, {});
};

// router.get("/buildMasterObj", (req, res) => {
//     let a = Object.keys(channelIDs);
//     let b = a.reduce((acc, cur) => {
//       console.log(">>>>>", contentIDs[cur]);
//       acc[cur] = {};
//       acc[cur].channelId = channelIDs[cur].value;
//       acc[cur].displayName = channelIDs[cur].displayName;
//       acc[cur].content = contentIDs[cur]
//         ? Object.entries(contentIDs[cur]).reduce(
//             (accu, [key, value], idx, arr) => {
//               console.log({ key, value });
//               accu.push({
//                 idx,
//                 title: key,
//                 contentId: value,
//                 mediaType: "movie",
//               });
//               return accu;
//             },
//             []
//           )
//         : [];
//       return acc;
//     }, {});
  
//     fs.writeFile(
//       `${__dirname}/../model/roku-master.json`,
//       JSON.stringify(b, null, 2),
//       "utf-8",
//       (err) => {
//         console.log({ err });
//       }
//     );
//     return res.json(b);
//   });
  

module.exports = {
  getKeysFromMaster,
  getChannelAndIdFromMaster,
  getChannelIdToContentListMap,
};
