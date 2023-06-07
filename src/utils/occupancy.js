const ONE_MINUTE_IN_MS = 60000;

function calculateOccupancyPercentage(library) {
  const occupancyHistory = library.occupancy?.history || [];

  const now = Date.now();
  const oneMinuteAgo = now - ONE_MINUTE_IN_MS;

  const lastOneMinuteOccupancies = occupancyHistory.filter((occupancy) => {
    const timestamp = Date.parse(occupancy.timestamp);
    return timestamp >= oneMinuteAgo;
  });

  const currentPeopleCount = lastOneMinuteOccupancies.reduce(
    (sum, occupancy) => sum + occupancy.peopleCount,
    0
  );

  const capacity = library.capacity || 0;
  const occupancyPercentage =
    currentPeopleCount / lastOneMinuteOccupancies.length / capacity;

  return occupancyPercentage;
}

module.exports = calculateOccupancyPercentage;
