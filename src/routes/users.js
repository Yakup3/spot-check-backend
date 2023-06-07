const { z } = require("zod");
const bcrypt = require("bcrypt");
const express = require("express");
const jwt = require("jsonwebtoken");
const { getDatabase } = require("../db");
const { ObjectId } = require("mongodb");
const authenticate = require("../middleware/authenticate");
const calculateOccupancyPercentage = require("../utils/occupancy");

const router = express.Router();
const collectionName = "users";
const libraryCollectionName = "libraries";

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("email:", email);
    console.log("password:", password);

    const schema = z.object({
      email: z.string().email(),
      password: z.string().min(6),
    });

    const validatedData = schema.parse({ email, password });

    const db = getDatabase();
    const user = await db
      .collection(collectionName)
      .findOne({ email: validatedData.email });
    if (!user) {
      return res.json({ message: "Invalid email or password", success: false });
    }

    const isPasswordValid = await bcrypt.compare(
      validatedData.password,
      user.password
    );
    if (!isPasswordValid) {
      return res.json({ message: "Invalid email or password", success: false });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
    res.status(200).json({
      message: "Login successful",
      data: {
        token,
        userId: user._id,
      },
      success: true,
    });
  } catch (error) {
    console.error("User login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.put("/favorite-libraries/:id", authenticate, async (req, res) => {
  try {
    const userId = req.params.id;
    const { libraryId, action } = req.body;

    const db = getDatabase();
    const objectId = new ObjectId(userId);

    let updateQuery;
    if (action === "add") {
      updateQuery = {
        $addToSet: { favoriteLibraryIds: libraryId },
      };
    } else if (action === "remove") {
      updateQuery = {
        $pull: { favoriteLibraryIds: libraryId },
      };
    } else {
      return res
        .status(400)
        .json({ message: "Invalid action", success: false });
    }

    const result = await db
      .collection(collectionName)
      .updateOne({ _id: objectId }, updateQuery);

    if (result.matchedCount === 0) {
      return res
        .status(404)
        .json({ message: "User not found", success: false });
    }

    res.status(200).json({
      message: "Favorite library updated successfully",
      success: true,
    });
  } catch (error) {
    console.error("Update favorite libraries error:", error);
    res.status(500).json({ message: "Internal server error", success: false });
  }
});

router.get("/favorite-libraries/:id", authenticate, async (req, res) => {
  try {
    const userId = req.params.id;

    const db = getDatabase();
    const userObjectId = new ObjectId(userId);

    const user = await db
      .collection(collectionName)
      .findOne({ _id: userObjectId });

    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found", success: false });
    }

    const favoriteLibraryIds = user.favoriteLibraryIds || [];

    const favoriteLibraries = await db
      .collection(libraryCollectionName)
      .find({ _id: { $in: favoriteLibraryIds.map((id) => new ObjectId(id)) } })
      .toArray();

    const favoriteLibrariesWithOccupancy = favoriteLibraries.map((library) => {
      return {
        id: library._id,
        name: library.name,
        location: library.location,
        occupancyPercentage: calculateOccupancyPercentage(library),
      };
    });

    res.status(200).json({
      favoriteLibraries: favoriteLibrariesWithOccupancy,
      success: true,
    });
  } catch (error) {
    console.error("Get favorite libraries error:", error);
    res.status(500).json({ message: "Internal server error", success: false });
  }
});

module.exports = router;
