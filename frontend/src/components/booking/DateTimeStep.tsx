import * as React from "react";
import { format, isBefore, startOfDay } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Calendar as CalendarIcon, Clock } from "lucide-react";

interface DateTimeStepProps {
  date: Date | null;
  time?: string;
  onChange: (data: { date: Date | null; time?: string }) => void;
}

const timeSlots = Array.from({ length: 21 }).map((_, i) => {
  // 08:00 to 18:00 in 30-min intervals
  const hour = 8 + Math.floor(i / 2);
  const minutes = i % 2 === 0 ? "00" : "30";
  const h = hour.toString().padStart(2, "0");
  return `${h}:${minutes}`;
});

export const DateTimeStep: React.FC<DateTimeStepProps> = ({ date, time, onChange }) => {
  const today = startOfDay(new Date());

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div>
        <label className="block text-sm font-medium mb-2">Select date</label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date ?? undefined}
              onSelect={(d) => onChange({ date: d ?? null, time })}
              disabled={(d) => isBefore(startOfDay(d), today)}
              initialFocus
              className={cn("p-3 pointer-events-auto")}
            />
          </PopoverContent>
        </Popover>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Select time</label>
        <Select value={time} onValueChange={(v) => onChange({ date, time: v })}>
          <SelectTrigger>
            <SelectValue placeholder="Choose a time" />
          </SelectTrigger>
          <SelectContent>
            {timeSlots.map((slot) => (
              <SelectItem key={slot} value={slot}>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" /> {slot}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
