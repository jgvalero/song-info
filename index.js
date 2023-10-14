import express from "express";
import axios from "axios";
import bodyParser from "body-parser";

import { readFile } from "fs/promises";

const app = express();
const port = 3000;

// Get config file
let config = null;
try {
  const filePath = new URL("./config.json", import.meta.url);
  const contents = await readFile(filePath, { encoding: "utf-8" });
  config = JSON.parse(contents);
} catch (err) {
  console.error(err.message);
}
const GENIUS_URL = "https://api.genius.com/";
const LASTFM_URL = "http://ws.audioscrobbler.com/2.0/";

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  try {
    res.render("index.ejs");
  } catch (error) {
    console.log(error.response.data);
    res.status(500);
  }
});

app.post("/", async (req, res) => {
  const searchArtist = req.body["artist"];
  const searchSong = req.body["song"];

  try {
    // Last.fm API request (search song)
    const lastfmSearchResult = await axios.get(
      `${LASTFM_URL}?method=track.search&artist=${searchArtist}&track=${searchSong}&api_key=${config["lastfmToken"]}&format=json`
    );
    const lastfmSearchData =
      lastfmSearchResult.data.results.trackmatches.track[0];
    const [artist, song] = [lastfmSearchData.artist, lastfmSearchData.name];
    // console.log(artist, song);

    // Last.fm API request (get song info)
    const lastfmResult = await axios.get(
      `${LASTFM_URL}?method=track.getInfo&artist=${artist}&track=${song}&api_key=${config["lastfmToken"]}&format=json`
    );
    const lastfmData = lastfmResult.data.track;
    const [listeners, playCount, summary] = [
      lastfmData.listeners,
      lastfmData.playcount,
      lastfmData.hasOwnProperty("wiki")
        ? lastfmData.wiki.summary
        : "No summary.",
    ];
    // console.log(listeners, playCount, summary);

    // Genius API request
    const geniusResult = await axios.get(
      `${GENIUS_URL}search?q=${artist} ${song}`,
      { headers: { Authorization: `Bearer ${config["geniusToken"]}` } }
    );
    const geniusData = geniusResult.data.response.hits[0].result;
    const [headerImageURL, songImageURL] = [
      geniusData.header_image_url,
      geniusData.song_art_image_url,
    ];
    // console.log(headerImageURL, songImageURL);

    res.render("index.ejs", {
      artist: artist,
      song: song,
      listeners: listeners,
      playCount: playCount,
      summary: summary,
      headerImageURL: headerImageURL,
      songImageURL: songImageURL,
    });
  } catch (error) {
    console.log(error);
    res.status(500);
  }
});

app.listen(port, () => {
  console.log(`Yo, we running this server on port ${port}!`);
});
