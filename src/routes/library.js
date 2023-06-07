const express = require("express");
const { ObjectId } = require("mongodb");
const { getDatabase } = require("../db");
const authenticate = require("../middleware/authenticate");
const calculateOccupancyPercentage = require("../utils/occupancy");

const router = express.Router();

const collectionName = "libraries";

router.put("/update/:id", async (req, res) => {
  try {
    const libraryId = req.params.id;
    const { peopleCount } = req.body;

    const db = getDatabase();
    const objectId = new ObjectId(libraryId);

    const updatedOccupancy = {
      peopleCount: peopleCount,
      timestamp: new Date().toLocaleString(),
    };

    const result = await db.collection(collectionName).updateOne(
      { _id: objectId },
      {
        $push: {
          "occupancy.history": updatedOccupancy,
        },
      },
      { upsert: true }
    );

    if (result.matchedCount === 0 && result.upsertedCount === 0) {
      return res
        .status(404)
        .json({ message: "Library not found", success: false });
    }

    res
      .status(200)
      .json({ message: "Library updated successfully", success: true });
  } catch (error) {
    console.error("Update library error:", error);
    res.status(500).json({ message: "Internal server error", success: false });
  }
});

router.get("/", authenticate, async (req, res) => {
  try {
    const db = getDatabase();

    const libraries = await db.collection(collectionName).find().toArray();

    const libraryList = libraries.map((library) => ({
      id: library._id,
      name: library.name,
      location: library.location,
      occupancyPercentage: calculateOccupancyPercentage(library),
    }));

    res.status(200).json({ libraryList, success: true });
  } catch (error) {
    console.error("Fetch library list error:", error);
    res.status(500).json({ message: "Internal server error", success: false });
  }
});

router.get("/:id", authenticate, async (req, res) => {
  try {
    const libraryId = req.params.id;

    const db = getDatabase();
    const objectId = new ObjectId(libraryId);

    const library = await db
      .collection(collectionName)
      .findOne({ _id: objectId });

    if (!library) {
      return res
        .status(404)
        .json({ message: "Library not found", success: false });
    }

    const occupancyHistory = library.occupancy?.history || [];
    const currentPeopleCount =
      occupancyHistory[occupancyHistory.length - 1]?.peopleCount || 0;
    const capacity = library.capacity || 0;

    const occupancyPercentage = currentPeopleCount / capacity;

    const libraryInfo = {
      name: library.name,
      location: library.location,
      occupancyPercentage: occupancyPercentage,
    };

    res.status(200).json({ libraryInfo, success: true });
  } catch (error) {
    console.error("Get library info error:", error);
    res.status(500).json({ message: "Internal server error", success: false });
  }
});

router.get("/occupancy/previous-days/:id", authenticate, async (req, res) => {
  try {
    const libraryId = req.params.id;

    const db = getDatabase();
    const objectId = new ObjectId(libraryId);

    const library = await db
      .collection(collectionName)
      .findOne({ _id: objectId });

    if (!library) {
      return res
        .status(404)
        .json({ success: false, message: "Library not found" });
    }

    const occupancyHistory = library.occupancy?.history || [];
    const capacity = library.capacity || 0;

    // Get previous days
    const previousDays = 7; // Adjust the number of previous days as needed
    const today = new Date();
    const startOfToday = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const previousDayDates = Array.from(
      { length: previousDays },
      (_, index) => {
        const previousDate = new Date(startOfToday);
        previousDate.setDate(previousDate.getDate() - index - 1);
        return previousDate.toLocaleDateString();
      }
    );

    // Calculate daily occupancy percentage for previous days
    const dailyOccupancy = previousDayDates.map((date) => {
      const occupancyOfDay = occupancyHistory.filter(
        (occupancy) =>
          new Date(occupancy.timestamp).toLocaleDateString() === date
      );

      const totalPeopleCount = occupancyOfDay.reduce(
        (sum, occupancy) => sum + occupancy.peopleCount / capacity,
        0
      );
      const dailyOccupancyPercentage =
        totalPeopleCount / occupancyOfDay.length || 0;

      return {
        date,
        occupancyPercentage: dailyOccupancyPercentage.toFixed(2),
      };
    });

    res.status(200).json({ dailyOccupancy, success: true });
  } catch (error) {
    console.error("Get previous days occupancy error:", error);
    res.status(500).json({ message: "Internal server error", success: false });
  }
});

module.exports = router;
