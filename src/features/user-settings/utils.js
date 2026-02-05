export const TIMEZONES = [
  { value: "UTC", label: "UTC" },
  { value: "America/New_York", label: "America/New_York" },
  { value: "Europe/London", label: "Europe/London" },
  { value: "Asia/Tokyo", label: "Asia/Tokyo" },
  { value: "Australia/Sydney", label: "Australia/Sydney" },
  // Add more timezones as needed
];

export const TIMEFORMAT = {HOUR_PM: "h:mm a", HOUR:"HH:mm", HOUR_SECONDS : "HH:mm:ss" }

export const DateFormats = {
  DD_MMM_YY: "DD-MMM-YY",              // 01-Feb-25
  MM_DD_YY: "MM/DD/YY",                // 02/25/25
  DD_MM_YY: "DD/MM/YY",                // 25/02/25
  FULL_LONG_US: "FULL_LONG_US",        // Saturday, February 01, 2025
  FULL_LONG_EU: "FULL_LONG_EU",        // Saturday, 01 February 2025
  MMM_DD_YYYY: "MMM DD, YYYY"          // Feb 01, 2025
};

export const MODULES = {MAIL: "mail", CALENDAR: "calendar", CONTACTS: "contacts", LAST: "last"};


//use to format date depending one the user preference
export function formatDate(date, format) {
  const d = new Date(date);

  const map = {
    DD: String(d.getDate()).padStart(2, "0"),
    MM: String(d.getMonth() + 1).padStart(2, "0"),
    YY: String(d.getFullYear()).slice(-2),
    YYYY: d.getFullYear(),
    MMM: d.toLocaleString("en-US", { month: "short" }),
    MMMM: d.toLocaleString("en-US", { month: "long" }),
    DAY: d.toLocaleString("en-US", { weekday: "long" })
  };

  switch (format) {
    case DateFormats.FULL_LONG_US:
      return `${map.DAY}, ${map.MMMM} ${map.DD}, ${map.YYYY}`;

    case DateFormats.FULL_LONG_EU:
      return `${map.DAY}, ${map.DD} ${map.MMMM} ${map.YYYY}`;

    default:
      return format.replace(/DD|MM|YY|YYYY|MMM|MMMM|DAY/g, m => map[m]);
  }
}


