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
	const contents = await readFile(filePath, {encoding: "utf-8" });
	config = JSON.parse(contents); 
	
} catch (err) {
	console.error(err.message);
}
const GENIUS_URL = "https://api.genius.com/";
const LASTFM_URL = "http://ws.audioscrobbler.com/2.0/"

app.use(bodyParser.urlencoded({extended: true}));

app.get("/", (req, res) => {
	try {
		res.render("index.ejs");
	}
	catch (error) {
		console.log(error.response.data);
		res.status(500);
	}
});

app.post("/", async (req, res) => {
	const searchArtist = req.body["artist"];
	const searchSong = req.body["song"];
	
	try {
		// Genius API request
		const geniusResult = await axios.get(`${GENIUS_URL}search?q=${searchArtist} ${searchSong}`, { headers: { Authorization: `Bearer ${config["geniusToken"]}` } });
		const geniusData = geniusResult.data.response.hits[0].result;
		const [fullTitle, artist, song] = [geniusData.full_title, geniusData.primary_artist.name, geniusData.title];

		// Last.fm API request
		const lastfmResult = await axios.get(`${LASTFM_URL}?method=track.getInfo&artist=${artist}&track=${song}&api_key=${config["lastfmToken"]}&format=json`);
		const lastfmData = lastfmResult.data.track;
		const [listeners, playCount, summary] = [lastfmData.listeners, lastfmData.playcount, lastfmData.wiki.summary];

		res.render("index.ejs", {
			fullTitle: fullTitle,
			artist: artist,
			song: song,
			listeners: listeners,
			playCount: playCount,
			summary: summary,
		});
	}
	catch (error) {
		console.log(error);
		res.status(500);
	}
});
	

app.listen(port, () => {
	console.log(`Yo, we running this server on port ${port}!`);
});
