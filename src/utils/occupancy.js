function calculateOccupancyPercentage(library) {
  const currentTimestamp = new Date();

  // Filter the data that occurred in the previous one minute
  const filteredData = library.occupancy?.history.filter((item) => {
    // Parse the timestamp of the item
    const itemTimestamp = new Date(item.timestamp);

    // Calculate the time difference in milliseconds
    const timeDifference = currentTimestamp - itemTimestamp;

    // Check if the item occurred in the previous one minute (60000 milliseconds)
    return timeDifference <= 60000;
  });

  const capacity = library.capacity;

  const currentPeopleCount = filteredData.reduce(
    (sum, occupancy) => sum + occupancy.peopleCount,
    0
  );

  const filteredDataCount = filteredData.length;

  const occupancyPercentage =
    filteredDataCount > 0
      ? currentPeopleCount / (filteredDataCount * capacity)
      : 0;

  return parseFloat(occupancyPercentage.toFixed(2));
}

module.exports = calculateOccupancyPercentage;
