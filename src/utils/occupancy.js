const ONE_MINUTE_IN_MS = 60000;

function calculateOccupancyPercentage(library) {
  const occupancyHistory = library.occupancy?.history || [];

  const now = new Date();
  const oneMinuteAgo = new Date(now.getTime() - ONE_MINUTE_IN_MS);

  const lastOneMinuteOccupancies = occupancyHistory.filter((occupancy) => {
    const timestamp = new Date(occupancy.timestamp);
    return timestamp >= oneMinuteAgo;
  });

  const capacity = library.capacity;

  const currentPeopleCount = lastOneMinuteOccupancies.reduce(
    (sum, occupancy) => sum + occupancy.peopleCount / capacity,
    0
  );

  const lastOneMinuteOccupanciesCount = lastOneMinuteOccupancies.length;

  const occupancyPercentage =
    currentPeopleCount / lastOneMinuteOccupanciesCount;

  return {
    occupancyPercentage: occupancyPercentage || 0,
    lastOneMinuteOccupancies,
  };
}

module.exports = calculateOccupancyPercentage;
