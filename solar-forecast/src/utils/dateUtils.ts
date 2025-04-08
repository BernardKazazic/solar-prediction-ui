import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

// Ensure plugins are added
dayjs.extend(customParseFormat);
dayjs.extend(timezone);
dayjs.extend(utc);

// Define the expected input format for Auth0 lastLogin
const lastLoginInputFormat = "ddd MMM DD HH:mm:ss z YYYY";

/**
 * Formats the lastLogin date string from Auth0.
 * Tries to parse the specific format, otherwise returns the original string or a placeholder.
 * @param value The date string (or null/undefined)
 * @param format The desired output format (defaults to 'YYYY-MM-DD HH:mm:ss')
 * @returns Formatted date string, original value on parse error, or '-'
 */
export const formatLastLogin = (
  value: string | null | undefined,
  format: string = "YYYY-MM-DD HH:mm:ss"
): string => {
  if (!value) {
    return "-"; // Handle null or undefined values
  }

  // Attempt to parse the date with the specific Auth0 format
  const parsedDate = dayjs(value, lastLoginInputFormat);

  if (parsedDate.isValid()) {
    // If parsing is successful, format it
    return parsedDate.format(format);
  } else {
    // If parsing fails, return the original value as a fallback
    // Log an error for debugging
    console.error("Failed to parse lastLogin date:", value);
    return value;
  }
};
