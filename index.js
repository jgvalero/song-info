import express from "express";
import axios from "axios";
import bodyParser from "body-parser";

const app = express();
const port = 3000;

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

app.post("/", (req, res) => {
	try {
		console.log(req.body);
		res.render("index.ejs");
	}
	catch (error) {
		console.log(error.response.data);
		res.status(500);
	}
});
	

app.listen(port, () => {
	console.log(`Yo, we running this server on port ${port}!`);
});
