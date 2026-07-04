export const upcomingEvents = [
  {
    id: 1,
    title: "Campus Maker Night",
    date: "Jul 8",
    time: "6:30 PM",
    location: "Downtown Studio",
    source: "Mock",
  },
  {
    id: 2,
    title: "Community Launch Mixer",
    date: "Jul 11",
    time: "8:00 PM",
    location: "River Hall",
    source: "Mock",
  },
  {
    id: 3,
    title: "Remote Product Workshop",
    date: "Jul 15",
    time: "10:00 AM",
    location: "Online",
    source: "Mock",
  },
];

export const calendarDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export const calendarPreview = Array.from({ length: 35 }, (_, index) => {
  const day = index + 1;

  return {
    day,
    hasEvent: [8, 11, 15, 22, 29].includes(day),
    isToday: day === 4,
  };
});
