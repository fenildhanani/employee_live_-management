const isWeekend = (date, weeklyOffs = ['Saturday', 'Sunday']) => {
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayName = dayNames[date.getDay()];
  return weeklyOffs.includes(dayName);
};

const isSameDay = (d1, d2) => {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
};

const calculateWorkingDays = (startDate, endDate, startSession = 'Full Day', endSession = 'Full Day', holidays = [], weeklyOffs = ['Saturday', 'Sunday']) => {
  let start = new Date(startDate);
  let end = new Date(endDate);

  if (start > end) return 0;

  let totalDays = 0;
  let current = new Date(start);

  const holidayDates = holidays.map((h) => new Date(h.date));

  const totalCalendarDays = Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1;

  while (current <= end) {
    const isWknd = isWeekend(current, weeklyOffs);
    const isHldy = holidayDates.some((hDate) => isSameDay(hDate, current));

    if (!isWknd && !isHldy) {
      if (totalCalendarDays === 1) {
        if (startSession !== 'Full Day' || endSession !== 'Full Day') {
          totalDays += 0.5;
        } else {
          totalDays += 1;
        }
      } else {
        if (isSameDay(current, start) && startSession !== 'Full Day') {
          totalDays += 0.5;
        } else if (isSameDay(current, end) && endSession !== 'Full Day') {
          totalDays += 0.5;
        } else {
          totalDays += 1;
        }
      }
    }
    current.setDate(current.getDate() + 1);
  }

  return totalDays;
};

module.exports = {
  isWeekend,
  isSameDay,
  calculateWorkingDays
};
