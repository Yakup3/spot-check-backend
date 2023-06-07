const dotenv = require("dotenv");
const express = require("express");
const cors = require("cors");
const { connectToDatabase } = require("./src/db");
const usersRoutes = require("./src/routes/users");
const libraryRoutes = require("./src/routes/library");

dotenv.config();

const app = express();

app.use(cors());

connectToDatabase()
  .then(() => {
    app.use(express.json());

    app.get("/", (req, res) => {
      res.send("Hello, world!");
    });

    app.use("/users", usersRoutes);

    app.use("/library", libraryRoutes);

    app.listen(process.env.PORT, () => {
      console.log("Server is running on port 3000");
    });
  })
  .catch((error) => {
    console.log(process.env.MONGODB_DB);
    console.error("Failed to connect to the database:", error);
  });
