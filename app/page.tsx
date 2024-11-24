import { CalendarEvent, ScheduleCard } from "./components/ScheduleCard";

const schedule: CalendarEvent[] = [
  {
    id: 1,
    title: "Morning Meeting",
    subtitle: "Team Sync",
    description: "Discuss project updates and tasks",
    startTime: "09:00",
    endTime: "10:00",
    isAllDay: false,
    color: "cornflowerblue",
  },
  {
    id: 2,
    title: "Lunch Break",
    subtitle: "",
    description: "Time to relax and have lunch",
    startTime: "12:00",
    endTime: "13:00",
    isAllDay: false,
    color: "mediumseagreen",
  },
  {
    id: 3,
    title: "Client Call",
    subtitle: "Project Discussion",
    description: "Call with client to discuss project requirements",
    startTime: "15:00",
    endTime: "16:00",
    isAllDay: false,
    color: "indianred",
  },
  {
    id: 4,
    title: "All Day Event",
    subtitle: "",
    description: "An event that lasts all day",
    startTime: null,
    endTime: null,
    isAllDay: true,
    color: "mediumpurple",
  },
  {
    id: 5,
    title: "Afternoon Workshop",
    subtitle: "Skill Development",
    description: "Workshop on new technology trends",
    startTime: "14:00",
    endTime: "15:30",
    isAllDay: false,
    color: "goldenrod",
  },
  {
    id: 6,
    title: "Evening Yoga",
    subtitle: "",
    description: "Relaxing yoga session",
    startTime: "18:00",
    endTime: "19:00",
    isAllDay: false,
    color: "lightcoral",
  },
  {
    id: 7,
    title: "Dinner with Friends",
    subtitle: "",
    description: "Dinner at the new restaurant in town",
    startTime: "20:00",
    endTime: "22:00",
    isAllDay: false,
    color: "darkorange",
  },
];

export default function Home() {
  return (
    <div className="grid grid-cols-4">
      <ScheduleCard schedule={schedule} />
    </div>
  );
}
