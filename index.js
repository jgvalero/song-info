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
	try {
		// console.log(req.body);
		let artist = req.body["artist"];
		let song = req.body["song"];
		res.render("index.ejs", {artist: artist, song: song});

		const result = await axios.get(`${GENIUS_URL}search?q=${artist} ${song}`, { headers: { Authorization: `Bearer ${config["geniusToken"]}` } });

		console.log(result.data.response.hits[0].result.id);
	}
	catch (error) {
		console.log(error.response.data);
		res.status(500);
	}
});
	

app.listen(port, () => {
	console.log(`Yo, we running this server on port ${port}!`);
});
