// Helper to check if a pantry is open based on its hours
export function isPantryOpen(hours: Record<string, string> | null | undefined): boolean {
  if (!hours || typeof hours !== 'object') return false;
  
  const now = new Date();
  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const currentDayIndex = now.getDay();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  
  for (const [dayRange, hoursStr] of Object.entries(hours)) {
    if (isDayInRange(dayRange, currentDayIndex, daysOfWeek)) {
      const lowerHours = hoursStr.toLowerCase();
      
      // Skip statuses that indicate the pantry is definitely closed
      if (lowerHours === 'closed' || lowerHours === 'by appointment only' || lowerHours === 'appointment only') {
        continue;
      }
      
      // Split by comma to handle multiple time ranges (e.g., "9:00 AM - 12:00 PM, 1:00 PM - 5:00 PM")
      const timeRanges = hoursStr.split(',').map(s => s.trim());
      
      for (const range of timeRanges) {
        const { openMinutes, closeMinutes } = parseHours(range);
        if (openMinutes !== null && closeMinutes !== null) {
          // Handle overnight hours (close time is earlier than open time)
          if (closeMinutes < openMinutes) {
            // Pantry is open if current time is after open OR before close
            if (currentMinutes >= openMinutes || currentMinutes < closeMinutes) {
              return true;
            }
          } else {
            // Normal same-day hours
            if (currentMinutes >= openMinutes && currentMinutes < closeMinutes) {
              return true;
            }
          }
        }
      }
    }
  }
  
  return false;
}

// Helper to get today's hours string
export function getTodayHours(hours: Record<string, string> | null | undefined): string {
  if (!hours || typeof hours !== 'object') return "Hours not available";
  
  const now = new Date();
  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const currentDayIndex = now.getDay();
  
  for (const [dayRange, hoursStr] of Object.entries(hours)) {
    if (isDayInRange(dayRange, currentDayIndex, daysOfWeek)) {
      return hoursStr;
    }
  }
  
  return "Closed today";
}

// Check if current day is in the day range
function isDayInRange(dayRange: string, currentDayIndex: number, daysOfWeek: string[]): boolean {
  if (dayRange.includes('-')) {
    const [startDay, endDay] = dayRange.split('-').map(d => d.trim());
    const startIdx = daysOfWeek.indexOf(startDay);
    const endIdx = daysOfWeek.indexOf(endDay);
    
    if (startIdx !== -1 && endIdx !== -1) {
      // Handle wrap-around (e.g., "Friday-Monday")
      if (startIdx > endIdx) {
        return currentDayIndex >= startIdx || currentDayIndex <= endIdx;
      } else {
        return currentDayIndex >= startIdx && currentDayIndex <= endIdx;
      }
    }
  } else {
    // Single day or comma-separated days
    return dayRange.includes(daysOfWeek[currentDayIndex]);
  }
  
  return false;
}

// Parse hours string into minutes since midnight
function parseHours(hoursStr: string): { openMinutes: number | null; closeMinutes: number | null } {
  // Try 12-hour format WITH minutes (e.g., "9:00 AM - 5:00 PM" or "9:00 am - 5:00 pm")
  let timeMatch = hoursStr.match(/(\d+):(\d+)\s*([APap][Mm])\s*[-–]\s*(\d+):(\d+)\s*([APap][Mm])/i);
  if (timeMatch) {
    let openHour = parseInt(timeMatch[1]);
    const openMin = parseInt(timeMatch[2]);
    let closeHour = parseInt(timeMatch[4]);
    const closeMin = parseInt(timeMatch[5]);
    
    const openPeriod = timeMatch[3].toUpperCase();
    const closePeriod = timeMatch[6].toUpperCase();
    
    // Convert to 24-hour format
    if (openPeriod === 'PM' && openHour !== 12) openHour += 12;
    if (closePeriod === 'PM' && closeHour !== 12) closeHour += 12;
    if (openPeriod === 'AM' && openHour === 12) openHour = 0;
    if (closePeriod === 'AM' && closeHour === 12) closeHour = 0;
    
    const openMinutes = openHour * 60 + openMin;
    const closeMinutes = closeHour * 60 + closeMin;
    
    return { openMinutes, closeMinutes };
  }
  
  // Try 12-hour format WITHOUT minutes (e.g., "9 AM - 5 PM", "9AM-5PM", "Noon-6 PM")
  timeMatch = hoursStr.match(/(\d+|Noon)\s*([APap]?[Mm]?)\s*[-–]\s*(\d+|Noon)\s*([APap][Mm])/i);
  if (timeMatch) {
    let openHour: number;
    let closeHour: number;
    
    // Handle "Noon" keyword
    if (timeMatch[1].toLowerCase() === 'noon') {
      openHour = 12;
    } else {
      openHour = parseInt(timeMatch[1]);
    }
    
    if (timeMatch[3].toLowerCase() === 'noon') {
      closeHour = 12;
    } else {
      closeHour = parseInt(timeMatch[3]);
    }
    
    const openPeriod = timeMatch[2] ? timeMatch[2].toUpperCase() : 'AM';
    const closePeriod = timeMatch[4].toUpperCase();
    
    // Convert to 24-hour format
    if (openPeriod === 'PM' && openHour !== 12) openHour += 12;
    if (closePeriod === 'PM' && closeHour !== 12) closeHour += 12;
    if (openPeriod === 'AM' && openHour === 12) openHour = 0;
    if (closePeriod === 'AM' && closeHour === 12) closeHour = 0;
    
    const openMinutes = openHour * 60;
    const closeMinutes = closeHour * 60;
    
    return { openMinutes, closeMinutes };
  }
  
  // Try 24-hour format (e.g., "08:00-17:00" or "08:00 - 17:00")
  const time24Match = hoursStr.match(/(\d+):(\d+)\s*[-–]\s*(\d+):(\d+)/);
  if (time24Match) {
    const openHour = parseInt(time24Match[1]);
    const openMin = parseInt(time24Match[2]);
    const closeHour = parseInt(time24Match[3]);
    const closeMin = parseInt(time24Match[4]);
    
    const openMinutes = openHour * 60 + openMin;
    const closeMinutes = closeHour * 60 + closeMin;
    
    return { openMinutes, closeMinutes };
  }
  
  return { openMinutes: null, closeMinutes: null };
}
