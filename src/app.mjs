import express from 'express';
import bodyParser from 'body-parser';
import router from './routes/sleep.mjs';
import path from 'path';
import { dirname, resolve } from "path"
import { fileURLToPath } from "url"

const app = express();

const __dirname = dirname(fileURLToPath(import.meta.url));

app.use(bodyParser.json());
app.use('/api', router);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.render('index');
    //res.send('HOME ROUTE');
});

export default app;
