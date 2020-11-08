var express = require("express");
var router = express.Router();
var fs = require("fs");

var contentIDs = require("../model/content-ids.json");
var channelIDs = require("../model/channel-ids.json");
var rokuIDs = require("../model/roku-ids.json");
var reverseChannelIds = require("../model/reverse-channel-ids.json");
var contentMapping = require("../model/content-mapping.json");
// const { returnMetaData } = require("../util");
const {
  getKeysFromMaster,
  getChannelAndIdFromMaster,
  getChannelIdToContentListMap,
} = require("../data-utils");
const urlMetadata = require("url-metadata");
const axios = require("axios");
const rokuMaster = require("../model/roku-master.json");

/* GET home page. */
router.get("/getIds", function (req, res, next) {
  // res.render('index', { title: 'Express' });
  res.json({
    rokuMaster: { data: rokuMaster, file: "Remote Roku/roku-master.json" },
    channelNames: {
      data: getChannelAndIdFromMaster(),
      file: "Remote Roku/channel-ids.json",
    },
    contentIds: {
      data: getChannelIdToContentListMap(),
      file: "Remote Roku/content-id-list.json",
    },
  });
});

router.post("/saveContent", async function (req, res, next) {
  const {
    body: { contentString, userSubmittedTitle },
  } = req;

  const cleanedContentString = contentString.replace(/\n/g, " ");
  const domainParser = new RegExp(/https?:\/\/w{0,3}\.?(?<parsedDomain>.*?)\./);
  const idParser = new RegExp(/\/\/.*\/(?<contentID>.*)\?/);
  // const netflixUrlParser = new RegExp(/title\/(?<contentID>.*?)\?/);
  const disneyPlusUrlParser = new RegExp(
    /https?:\/\/(?<domain>.*?)\/(?<contentType>.*?)\/(?<encodedName>.*?)\/(?<contentID>.*?)\?/
  );
  const disneyMessageParser = new RegExp(/"(?<contentTitle>.*)"/);

  // const huluUrlParser = new RegExp(/ /);
  const huluMessageParser = new RegExp(
    /out (this episode of )?(?<contentTitle>.*) on/
  );
  const { parsedDomain } = (
    cleanedContentString.match(domainParser) || {}
  ).groups;

  switch (parsedDomain) {
    case "netflix":
      const { contentID: netflixID } = cleanedContentString.match(
        idParser
      ).groups;
      const { contentTitle: netflixTitle } = cleanedContentString.match(
        huluMessageParser
      ).groups;
      console.log({ netflixTitle, netflixID });
      const cleanedNetflixTitle = netflixTitle.slice(
        1,
        netflixTitle.length - 1
      );
      console.log({ netflixTitle, cleanedNetflixTitle });
      if (netflixID) {
        contentIDs[parsedDomain][cleanedNetflixTitle] = netflixID;
      }
      break;

    case "disneyplus":
      const {
        contentType,
        encodedName,
        contentID: disneyID,
      } = cleanedContentString.match(disneyPlusUrlParser).groups;

      const { contentTitle } = cleanedContentString.match(
        disneyMessageParser
      ).groups;
      console.log({ contentType, encodedName, disneyID, contentTitle });

      if (disneyID) {
        contentIDs[parsedDomain][
          userSubmittedTitle || contentTitle
        ] = contentID;
      } else {
        return res.send("No ID found");
      }
      break;

    case "hulu":
      // const x = contentString.split(" ").find((x) => x.includes("http"));
      // console.log({ x });
      // try {
      //   const y = await urlMetadata(x);
      //   console.log("object");
      //   console.log({ y });
      //   // contentIDs[parsedDomain][youtubeTitle] = videoId;
      // } catch (err) {
      //   // console.log('222222');
      //   return res.send(err);
      // }
      // return res.send({});
      const { contentID: huluID } = cleanedContentString.match(idParser).groups;
      const { contentTitle: huluTitle } = cleanedContentString.match(
        huluMessageParser
      ).groups;

      if (huluID) {
        contentIDs[parsedDomain][userSubmittedTitle || huluTitle] = huluID;
      } else {
        return res.send("No ID found");
      }
      break;

    case "youtube":
      try {
        const { title: youtubeTitle, videoId } = await urlMetadata(
          cleanedContentString
        );
        contentIDs[parsedDomain][youtubeTitle] = videoId;
      } catch (err) {
        res.send(err);
      }
  }

  fs.writeFile(
    `${__dirname}/../model/content-ids.json`,
    JSON.stringify(contentIDs, null, 2),
    "utf-8",
    (err) => {
      console.log({ err });
    }
  );
  return res.json(contentIDs);
});

router.get("/launch", (req, res) => {
  const { device, channel, content } = req.query;
  const mediaType = "movie";
  console.log({ device, channel, content });
  const url = `http://${device}:8060/launch/${channel}?contentId=${content}&mediaType=${mediaType}`;

  axios
    .post(url)
    .then((data) => {
      console.log({ data });
      res.send(url);
    })
    .catch((err) => {
      console.log({ err });
      res.status(500).send(err);
    });
});

module.exports = router;
