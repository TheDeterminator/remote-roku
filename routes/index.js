var express = require("express");
var router = express.Router();
var fs = require("fs");

var contentIDs = require("../model/content-ids.json");
var channelIDs = require("../model/channel-ids.json");
var rokuIDs = require("../model/roku-ids.json");

/* GET home page. */
router.get("/getIds", function (req, res, next) {
  // res.render('index', { title: 'Express' });
  const id = req.query.id;

  switch (id) {
    case "roku":
      res.json(rokuIDs);
      break;
    case "channel":
      res.json(channelIDs);
      break;
    case "content":
      res.json(contentIDs);
      break;
  }
});

router.post("/saveContent", function (req, res, next) {
  const {
    body: { contentString, userSubmittedTitle },
  } = req;

  const cleanedContentString = contentString.replace("\n", " ");
  const domainParser = new RegExp(/https?:\/\/w{0,3}\.?(?<parsedDomain>.*?)\./);
  const netflixParser = new RegExp(/title\/(?<contentID>.*?)\?/);
  const disneyPlusUrlParser = new RegExp(
    /https?:\/\/(?<domain>.*?)\/(?<contentType>.*?)\/(?<encodedName>.*?)\/(?<contentID>.*?)\?/
  );
  const disneyMessageParser = new RegExp(/"(?<contentTitle>.*)"/);

  const huluUrlParser = new RegExp(/ /);
  const huluMessageParser = new RegExp(/out (this episode of )?(?<contentTitle>.*) on/);
  const { parsedDomain } = cleanedContentString.match(domainParser).groups;

  const objectOfRegexes = {
    netflix: /title\/(?<contentID>.*?)\?/,
    "disney+": /https?:\/\/.*?\/(?<contentType>.*?)\/(?<encodedName>.*?)\/(?<contentID>.*?)\?/,
  };

  // let urlContentString;
  // let messageContentString;
  // let urlMatches;
  // let messageMatches;
  console.log({ parsedDomain, userSubmittedTitle, cleanedContentString });

  switch (parsedDomain) {
    case "netflix":
      const { contentID: netflixID } = cleanedContentString.match(
        netflixParser
      ).groups;
      if (contentID) {
        contentIDs[parsedDomain][userSubmittedTitle] = netflixID;
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
        return res.json(contentIDs);
      }
      return res.send("No ID found");

    case "hulu":
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

module.exports = router;
