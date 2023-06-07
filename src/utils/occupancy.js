const moment = require("moment");

function calculateOccupancyPercentage(library) {
  const occupancyHistory = library.occupancy?.history || [];

  const now = moment();
  const oneMinuteAgo = moment(now).subtract(10, "minutes");

  const lastOneMinuteOccupancies = occupancyHistory.filter((occupancy) => {
    const timestamp = moment(occupancy.timestamp, "M/D/YYYY, h:mm:ss A");
    return timestamp.isBetween(oneMinuteAgo, now);
  });

  const capacity = library.capacity;

  const currentPeopleCount = lastOneMinuteOccupancies.reduce(
    (sum, occupancy) => sum + occupancy.peopleCount,
    0
  );

  const lastOneMinuteOccupanciesCount = lastOneMinuteOccupancies.length;

  const occupancyPercentage =
    lastOneMinuteOccupanciesCount > 0
      ? currentPeopleCount / (lastOneMinuteOccupanciesCount * capacity)
      : 0;

  return occupancyPercentage.toFixed(2);
}

module.exports = calculateOccupancyPercentage;
