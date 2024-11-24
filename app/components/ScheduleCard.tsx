'use client'

import { format } from "date-fns";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, LayoutList } from "lucide-react";
import React, { useEffect, useRef, useState } from 'react';

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionTrigger, AccordionItem, AccordionContent } from "@/components/ui/accordion";

export interface CalendarEvent {
  id: number;
  title: string;
  subtitle?: string;
  description?: string;
  startTime: string | null;
  endTime: string | null;
  isAllDay: boolean;
  color: string;
}

interface ScheduleCardProps extends React.HTMLAttributes<HTMLDivElement> {
  schedule: CalendarEvent[];
}

export const ScheduleCard = ({ schedule, className }: ScheduleCardProps) => {
  const [date, setDate] = useState(new Date());
  const now = new Date();
  const isToday = now.toDateString() === date.toDateString();
  const [view, setView] = useState('timeline');
  const [is24Hour, setIs24Hour] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const navigateDay = (direction: number) => {
    const newDate = new Date(date);
    newDate.setDate(date.getDate() + direction);
    setDate(newDate);
  };

  const formatTime = (time: string) => {
    if (!time) return "";
    const [hours, minutes] = time.split(':');
    if (is24Hour) return `${hours}:${minutes}`;
    const hour = parseInt(hours);
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${period}`;
  };

  const HOUR_HEIGHT = 60; // pixels per hour
  
  const getEventPosition = (startTime: string) => {
    const [hours, minutes] = startTime.split(':').map(Number);
    return (hours * HOUR_HEIGHT) + ((minutes / 60) * HOUR_HEIGHT);
  };

  const getEventHeight = (startTime: string, endTime: string) => {
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);
    const startInMinutes = (startHours * 60) + startMinutes;
    const endInMinutes = (endHours * 60) + endMinutes;
    return ((endInMinutes - startInMinutes) / 60) * HOUR_HEIGHT;
  };

  useEffect(() => {
    const currentTime = now.getHours() * 60 + now.getMinutes();

    const upcomingEvent = schedule
      .filter(event => !event.isAllDay && event.startTime)
      .reduce((selectedEvent: CalendarEvent | null, currentEvent: CalendarEvent) => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const [currentStartHours, currentStartMinutes] = currentEvent.startTime!.split(':').map(Number);
        const currentEventTime = currentStartHours * 60 + currentStartMinutes;

        if (!selectedEvent) return currentEvent;
        if (isToday) {
          // Show the upcoming event if there are any left for today
          if (currentEventTime >= currentTime) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const [selectedStartHours, selectedStartMinutes] = selectedEvent.startTime!.split(':').map(Number);
            const selectedEventTime = selectedStartHours * 60 + selectedStartMinutes;
            return currentEventTime >= selectedEventTime ? currentEvent : selectedEvent;
          }
        } else {
          // Show the earliest event
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          const [selectedStartHours, selectedStartMinutes] = selectedEvent.startTime!.split(':').map(Number);
          const selectedEventTime = selectedStartHours * 60 + selectedStartMinutes;
          return currentEventTime < selectedEventTime ? currentEvent : selectedEvent;
        }
        // If there are no upcoming events, show the last event
        return selectedEvent;
      }, null);
  
    const eventToScrollTo = upcomingEvent || schedule[schedule.length - 1];
  
    if (eventToScrollTo && scrollRef.current) {
      const position = getEventPosition(eventToScrollTo.startTime || '');
      scrollRef.current.scrollTo({
        top: position,
        behavior: "auto"
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schedule, date, is24Hour, view]);

  const allDayEvents = schedule.filter(event => event.isAllDay);
  const TimelineView = () => {
    const events = schedule
      .filter(event => !event.isAllDay && event.startTime && event.endTime)
      .map(event => ({
        ...event,
        top: getEventPosition(event.startTime || ''),
        height: getEventHeight(event.startTime || '', event.endTime || '')
      }));

    // Sort events by start time
    events.sort((a, b) => a.top - b.top);

    return (
      <div className="h-full w-full">
        {allDayEvents.length > 0 && (
          <Accordion type="single" defaultValue="allDayEvents" collapsible className="pb-3">
            <AccordionItem value="allDayEvents">
              <AccordionTrigger>
                <h3 className="font-medium mb-1 ml-2">All-Day Events</h3>
              </AccordionTrigger>
              <AccordionContent>
                {allDayEvents.map(event => (
                  <div
                    key={event.id}
                    className={cn(
                      "px-2 mb-2 rounded-md",
                      "text-white"
                    )}
                    style={{
                      backgroundColor: event.color
                    }}
                  >
                    <div className="font-medium">{event.title}</div>
                    {event.subtitle && <div className="text-sm italic">{event.subtitle}</div>}
                    {event.description && <div className="text-sm">{event.description}</div>}
                  </div>
                ))}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}

        {/* Scrollable Timeline */}
        <ScrollArea className="h-[500px] pr-4" scrollRef={scrollRef}>
          <div className="relative" style={{ height: `${24 * HOUR_HEIGHT}px` }}>
            {/* Hour markers and separators */}
            {Array.from({ length: 24 }, (_, i) => (
              <div 
                key={i} 
                className="absolute w-full"
                style={{ top: `${i * HOUR_HEIGHT}px` }}
              >
                <div className="grid grid-cols-[72px_1fr] lg:grid-cols-[84px_1fr] gap-2">
                  <div className="text-sm text-muted-foreground text-nowrap sticky left-0">
                    {formatTime(`${String(i).padStart(2, '0')}:00`)}
                  </div>
                  <Separator className="mt-2" />
                </div>
              </div>
            ))}

            {/* Events */}
            <div className="absolute left-[100px] lg:left-[117px] right-0 lg:right-2">
              {events.map((event, index) => {
                // Check for overlap with previous event
                const isOverlapping = index > 0 && events[index - 1].top + events[index - 1].height > event.top;
                const leftOffset = isOverlapping ? '10%' : '0';

                return (
                  <div
                    key={event.id}
                    className={cn(
                      "absolute px-2 mt-2 rounded-md w-[calc(100%-8px)]",
                      "text-white"
                    )}
                    style={{
                      backgroundColor: event.color,
                      top: `${event.top}px`,
                      height: `${event.height}px`,
                      minHeight: '20px',
                      left: leftOffset
                    }}
                  >
                    <div className="text-sm">
                      {event.title}
                      {event.height < 45 && (
                        <span>, {formatTime(event.startTime || '')} - {formatTime(event.endTime || '')}</span>
                      )}
                    </div>
                    {/* Show time on second row only if event is more than 45px */}
                    {event.height >= 45 && (
                      <div className="text-sm">
                        {formatTime(event.startTime || '')} - {formatTime(event.endTime || '')}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </ScrollArea>
      </div>
    );
  };

  const ListView = () => (
    <ScrollArea className="h-[576px] pt-4 pr-4 w-full">
      {schedule.map(event => (
        <div
          key={event.id}
          className={cn(
            "flex-shrink-0",
            "p-3 mb-2 rounded-md",
            "text-white"
          )}
          style={{
            backgroundColor: event.color
          }}
        >
          <div className="font-medium">{event.title}</div>
          {event.subtitle && <div className="text-sm italic">{event.subtitle}</div>}
          {event.description && <div className="text-sm">{event.description}</div>}
          {!event.isAllDay && (
            <div className="text-sm mt-1">
              {formatTime(event.startTime || '')} - {formatTime(event.endTime || '')}
            </div>
          )}
          {event.isAllDay && <div className="text-sm mt-1">All Day</div>}
        </div>
      ))}
    </ScrollArea>
  );

  const DateToolbar = ({ className }: { className?: string }) => (
    <div className={className}>
      <Button
        variant="outline"
        size="icon"
        onClick={() => navigateDay(-1)}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "justify-start text-left font-normal",
            )}
          >
            {format(date, "EEE do MMMM")}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(newDate) => {
              setDate(newDate || new Date());
              setCalendarOpen(false);
            }}
            initialFocus
          />
        </PopoverContent>
      </Popover>
      <Button
        variant="outline"
        size="icon"
        onClick={() => navigateDay(1)}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )

  const ViewToolbar = ({ className }: { className?: string }) => (
    <div className={className}>
      <Button
        variant="outline"
        onClick={() => setIs24Hour(!is24Hour)}
      >
        {is24Hour ? "24h" : "12h"}
      </Button>
      <Button
        variant="outline"
        style={{
          backgroundColor: isToday ? "hsl(var(--accent))" : "hsl(var(--background))",
        }}
        onClick={() => setDate(new Date())}
      >
        Today
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={() => setView(view === 'timeline' ? 'list' : 'timeline')}
      >
        {view === 'timeline' ? (
          <LayoutList className="h-4 w-4" />
        ) : (
          <CalendarIcon className="h-4 w-4" />
        )}
      </Button>
    </div>
  )

  return (
    <Card className={cn("h-full w-full", className)}>
      <CardHeader className="flex flex-col items-center gap-2 pt-2 pb-0">
        <CardTitle className="sr-only">Schedule</CardTitle>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <DateToolbar className="flex items-center justify-between space-x-2" />
          <ViewToolbar className="flex items-center justify-between space-x-2" />
        </div>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-between gap-4 pb-4 px-2 lg:px-4">
        {view === 'timeline' ? <TimelineView /> : <ListView />}
      </CardContent>
    </Card>
  );
};
