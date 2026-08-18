const { calculateWorkingDays } = require('../utils/dateUtils');

describe('Leave Calculation Logic Test Suite', () => {
  it('should exclude weekends (Sat/Sun) when calculating leave duration', () => {
    // Friday Aug 15 2026 to Monday Aug 18 2026 (4 calendar days: Fri, Sat, Sun, Mon)
    const startDate = new Date(2026, 7, 15); // Friday
    const endDate = new Date(2026, 7, 18);   // Monday

    const workingDays = calculateWorkingDays(startDate, endDate, 'Full Day', 'Full Day', [], ['Saturday', 'Sunday']);
    expect(workingDays).toEqual(2); // Friday and Monday only
  });

  it('should exclude holidays from leave day count', () => {
    const startDate = new Date(2026, 7, 17); // Monday
    const endDate = new Date(2026, 7, 19);   // Wednesday
    const holidays = [{ date: new Date(2026, 7, 18) }]; // Tuesday is holiday

    const workingDays = calculateWorkingDays(startDate, endDate, 'Full Day', 'Full Day', holidays, ['Saturday', 'Sunday']);
    expect(workingDays).toEqual(2); // Monday and Wednesday
  });

  it('should accurately calculate half-day requests (0.5 day)', () => {
    const startDate = new Date(2026, 7, 17); // Monday
    const endDate = new Date(2026, 7, 17);   // Monday

    const workingDays = calculateWorkingDays(startDate, endDate, 'First Half', 'First Half', [], ['Saturday', 'Sunday']);
    expect(workingDays).toEqual(0.5);
  });
});
