const ONE_MINUTE_IN_MS = 60000;

function calculateOccupancyPercentage(library) {
  const occupancyHistory = library.occupancy?.history || [];

  const now = new Date();
  const oneMinuteAgo = now.getTime() - ONE_MINUTE_IN_MS;

  const lastOneMinuteOccupancies = occupancyHistory.filter((occupancy) => {
    const timestamp = new Date(occupancy.timestamp).getTime();
    return timestamp >= oneMinuteAgo;
  });

  const capacity = library.capacity;

  const currentPeopleCount = lastOneMinuteOccupancies.reduce(
    (sum, occupancy) => sum + occupancy.peopleCount,
    0
  );

  const occupancyPercentage =
    currentPeopleCount / (capacity * lastOneMinuteOccupancies.length);

  return {
    occupancyPercentage: occupancyPercentage || 0,
    lastOneMinuteOccupancies,
  };
}

module.exports = calculateOccupancyPercentage;
