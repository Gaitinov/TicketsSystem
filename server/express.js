const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const authRouter = require('./authRouter')

const app = express();
const port = process.env.port || 3000

app.use(express.static(path.join(__dirname, '..', 'client', 'public')));
app.use(express.json());
app.use("/auth", authRouter)

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '..', 'client', 'views'));




async function connection() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/myDatabase', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`it works!`);

    const informationSchema = new mongoose.Schema({
      // define your schema fields here
    });

    const Information = mongoose.model('Information', informationSchema);

    const information = await Information.find().lean();
    // console.log(information);

    app.get('/', (req, res) => {
      const page = 'index';
      res.render(page, { data: information });
    });

    app.get('/:page', function (req, res, next) {
      const page = req.params.page;
      res.render(
        page,
        { data: information },
        function (err, html) {
          if (err) {
            next(err);
          } else {
            res.send(html);
          }
        }
      );
    });

    app.use(function (err, req, res, next) {
      if (err) {
        console.error(err);
        res.status(404).send('Page not Found');
      } else {
        next();
      }
    });
  } catch (error) {
    console.log('Error!');
  }
}

connection();

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
