const ONE_MINUTE_IN_MS = 600000;

function calculateOccupancyPercentage(library) {
  const occupancyHistory = library.occupancy?.history || [];

  const now = new Date();
  const oneMinuteAgo = new Date(now.getTime() - ONE_MINUTE_IN_MS);

  const lastOneMinuteOccupancies = occupancyHistory.filter((occupancy) => {
    const timestamp = new Date(occupancy.timestamp);
    return timestamp >= oneMinuteAgo && timestamp <= now;
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

  return occupancyPercentage;
}

module.exports = calculateOccupancyPercentage;
