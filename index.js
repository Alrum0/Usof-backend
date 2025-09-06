require('dotenv').config();

const express = require('express');
const router = require('./routes/index');
const errorHandler = require('./middleware/ErrorHandlingMiddleware');
const path = require('path');
const fileUpload = require('express-fileupload');

const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(fileUpload({}));
app.use(express.static(path.resolve(__dirname, 'static')));
app.use('/api', router);
app.use(errorHandler);

app.get('/', (req, res) => {
  res.status(200).json({ message: 'Server works!' });
});

app.listen(PORT, () => {
  console.log(`Server running http://localhost:${PORT}`);
});
