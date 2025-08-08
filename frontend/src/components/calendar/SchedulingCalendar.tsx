import React, { useState, useCallback } from 'react';
import { Calendar, momentLocalizer, View, Event } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon, Clock, Plus, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const localizer = momentLocalizer(moment);

interface CalendarEvent extends Event {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: 'booking' | 'availability' | 'blocked';
  status?: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  customerId?: string;
  providerId?: string;
  serviceId?: string;
  notes?: string;
}

interface SchedulingCalendarProps {
  events?: CalendarEvent[];
  onEventCreate?: (event: Omit<CalendarEvent, 'id'>) => void;
  onEventUpdate?: (event: CalendarEvent) => void;
  onEventDelete?: (eventId: string) => void;
  readonly?: boolean;
  userRole?: 'customer' | 'provider' | 'admin';
}

const SchedulingCalendar: React.FC<SchedulingCalendarProps> = ({
  events = [],
  onEventCreate,
  onEventUpdate,
  onEventDelete,
  readonly = false,
  userRole = 'customer',
}) => {
  const { toast } = useToast();
  const [view, setView] = useState<View>('month');
  const [date, setDate] = useState(new Date());
  const [showEventDialog, setShowEventDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Mock events for demonstration
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([
    {
      id: '1',
      title: 'Plumbing Service - Kitchen Sink',
      start: new Date(2024, 11, 15, 10, 0),
      end: new Date(2024, 11, 15, 12, 0),
      type: 'booking',
      status: 'confirmed',
      customerId: 'customer1',
      providerId: 'provider1',
      serviceId: 'service1',
      notes: 'Fix leaky kitchen sink'
    },
    {
      id: '2',
      title: 'Available for Bookings',
      start: new Date(2024, 11, 16, 9, 0),
      end: new Date(2024, 11, 16, 17, 0),
      type: 'availability',
      providerId: 'provider1'
    },
    {
      id: '3',
      title: 'Electrical Inspection',
      start: new Date(2024, 11, 18, 14, 0),
      end: new Date(2024, 11, 18, 16, 0),
      type: 'booking',
      status: 'pending',
      customerId: 'customer2',
      providerId: 'provider2',
      serviceId: 'service2'
    }
  ]);

  const [eventForm, setEventForm] = useState({
    title: '',
    start: '',
    end: '',
    type: 'booking' as CalendarEvent['type'],
    status: 'pending' as CalendarEvent['status'],
    notes: ''
  });

  const handleSelectSlot = useCallback(
    ({ start, end }: { start: Date; end: Date }) => {
      if (readonly) return;

      setEventForm({
        title: '',
        start: moment(start).format('YYYY-MM-DDTHH:mm'),
        end: moment(end).format('YYYY-MM-DDTHH:mm'),
        type: userRole === 'provider' ? 'availability' : 'booking',
        status: 'pending',
        notes: ''
      });
      setSelectedEvent(null);
      setIsEditing(false);
      setShowEventDialog(true);
    },
    [readonly, userRole]
  );

  const handleSelectEvent = useCallback((event: CalendarEvent) => {
    setSelectedEvent(event);
    setEventForm({
      title: event.title,
      start: moment(event.start).format('YYYY-MM-DDTHH:mm'),
      end: moment(event.end).format('YYYY-MM-DDTHH:mm'),
      type: event.type,
      status: event.status || 'pending',
      notes: event.notes || ''
    });
    setIsEditing(true);
    setShowEventDialog(true);
  }, []);

  const handleSaveEvent = () => {
    const eventData = {
      ...eventForm,
      start: new Date(eventForm.start),
      end: new Date(eventForm.end),
    };

    if (isEditing && selectedEvent) {
      const updatedEvent = { ...selectedEvent, ...eventData };
      setCalendarEvents(prev => 
        prev.map(event => event.id === selectedEvent.id ? updatedEvent : event)
      );
      onEventUpdate?.(updatedEvent);
      
      toast({
        title: 'Event Updated',
        description: 'The calendar event has been updated successfully.',
      });
    } else {
      const newEvent: CalendarEvent = {
        id: `event_${Date.now()}`,
        ...eventData,
      };
      setCalendarEvents(prev => [...prev, newEvent]);
      onEventCreate?.(eventData);
      
      toast({
        title: 'Event Created',
        description: 'A new calendar event has been created.',
      });
    }

    setShowEventDialog(false);
    resetForm();
  };

  const handleDeleteEvent = () => {
    if (selectedEvent) {
      setCalendarEvents(prev => prev.filter(event => event.id !== selectedEvent.id));
      onEventDelete?.(selectedEvent.id);
      setShowEventDialog(false);
      resetForm();
      
      toast({
        title: 'Event Deleted',
        description: 'The calendar event has been deleted.',
      });
    }
  };

  const resetForm = () => {
    setEventForm({
      title: '',
      start: '',
      end: '',
      type: 'booking',
      status: 'pending',
      notes: ''
    });
    setSelectedEvent(null);
    setIsEditing(false);
  };

  const eventStyleGetter = (event: CalendarEvent) => {
    let backgroundColor = '#3b82f6';
    
    switch (event.type) {
      case 'booking':
        switch (event.status) {
          case 'confirmed':
            backgroundColor = '#10b981';
            break;
          case 'pending':
            backgroundColor = '#f59e0b';
            break;
          case 'completed':
            backgroundColor = '#6b7280';
            break;
          case 'cancelled':
            backgroundColor = '#ef4444';
            break;
        }
        break;
      case 'availability':
        backgroundColor = '#8b5cf6';
        break;
      case 'blocked':
        backgroundColor = '#374151';
        break;
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block'
      }
    };
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            {userRole === 'provider' ? 'Availability Calendar' : 'Booking Calendar'}
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-blue-500 text-white">Booking</Badge>
            <Badge variant="outline" className="bg-purple-500 text-white">Available</Badge>
            <Badge variant="outline" className="bg-gray-500 text-white">Blocked</Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div style={{ height: '600px' }}>
          <Calendar
            localizer={localizer}
            events={calendarEvents}
            startAccessor="start"
            endAccessor="end"
            style={{ height: '100%' }}
            view={view}
            onView={setView}
            date={date}
            onNavigate={setDate}
            selectable={!readonly}
            onSelectSlot={handleSelectSlot}
            onSelectEvent={handleSelectEvent}
            eventPropGetter={eventStyleGetter}
            popup
            views={['month', 'week', 'day', 'agenda']}
            step={30}
            showMultiDayTimes
            defaultDate={new Date()}
          />
        </div>

        {/* Event Dialog */}
        <Dialog open={showEventDialog} onOpenChange={setShowEventDialog}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {isEditing ? 'Edit Event' : 'Create New Event'}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={eventForm.title}
                  onChange={(e) => setEventForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Event title"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Start</label>
                  <Input
                    type="datetime-local"
                    value={eventForm.start}
                    onChange={(e) => setEventForm(prev => ({ ...prev, start: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">End</label>
                  <Input
                    type="datetime-local"
                    value={eventForm.end}
                    onChange={(e) => setEventForm(prev => ({ ...prev, end: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Type</label>
                  <Select value={eventForm.type} onValueChange={(value: CalendarEvent['type']) => 
                    setEventForm(prev => ({ ...prev, type: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="booking">Booking</SelectItem>
                      <SelectItem value="availability">Available</SelectItem>
                      <SelectItem value="blocked">Blocked</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {eventForm.type === 'booking' && (
                  <div>
                    <label className="text-sm font-medium">Status</label>
                    <Select value={eventForm.status} onValueChange={(value: CalendarEvent['status']) => 
                      setEventForm(prev => ({ ...prev, status: value }))
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <div>
                <label className="text-sm font-medium">Notes</label>
                <Textarea
                  value={eventForm.notes}
                  onChange={(e) => setEventForm(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional notes..."
                  rows={3}
                />
              </div>

              <div className="flex justify-between pt-4">
                <div>
                  {isEditing && (
                    <Button variant="destructive" onClick={handleDeleteEvent}>
                      Delete Event
                    </Button>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setShowEventDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveEvent}>
                    {isEditing ? 'Update' : 'Create'} Event
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default SchedulingCalendar;