import dayjs from 'dayjs'

export const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

// Function to generate an array of days for the given month
export const generateDaysOfMonth = (year, month) => {
  const startOfMonth = dayjs(new Date(year, month, 1))
  const endOfMonth = startOfMonth.endOf('month')

  const days = []
  let currentDay = startOfMonth

  // Fill in empty blocks for days before the first day of the month (starting on Monday)
  const firstDayOfWeek = (currentDay.day() === 0 ? 7 : currentDay.day()) - 1 // Adjust so Monday is the first day
  for (let i = 0; i < firstDayOfWeek; i++) {
    days.push(null)
  }

  // Fill in the days of the month
  while (currentDay.isBefore(endOfMonth) || currentDay.isSame(endOfMonth)) {
    days.push(currentDay)
    currentDay = currentDay.add(1, 'day')
  }

  // Add empty blocks after the last day of the month to complete the last week
  const totalCells = Math.ceil(days.length / 7) * 7 // Ensure complete rows (7 days per week)
  while (days.length < totalCells) {
    days.push(null)
  }

  return days
}
