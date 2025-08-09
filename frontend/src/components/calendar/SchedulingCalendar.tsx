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
import { CalendarIcon, Clock, Plus, Edit, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCalendar, CalendarEvent } from '@/hooks/useCalendar';

const localizer = momentLocalizer(moment);

interface SchedulingCalendarProps {
  providerId?: string;
  customerId?: string;
  readonly?: boolean;
  userRole?: 'customer' | 'provider' | 'admin';
}

const SchedulingCalendar: React.FC<SchedulingCalendarProps> = ({
  providerId,
  customerId,
  readonly = false,
  userRole = 'customer',
}) => {
  const { toast } = useToast();
  const [view, setView] = useState<View>('month');
  const [date, setDate] = useState(new Date());
  const [showEventDialog, setShowEventDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Use real API through the useCalendar hook
  const {
    events: calendarEvents,
    loading,
    error,
    createEvent,
    updateEvent,
    deleteEvent,
    refreshEvents,
  } = useCalendar({
    providerId,
    customerId,
    autoLoad: true,
  });

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
        type: 'booking',
        status: 'pending',
        notes: ''
      });
      setSelectedEvent(null);
      setIsEditing(false);
      setShowEventDialog(true);
    },
    [readonly]
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

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!eventForm.title || !eventForm.start || !eventForm.end) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    const eventData: Omit<CalendarEvent, 'id'> = {
      title: eventForm.title,
      start: new Date(eventForm.start),
      end: new Date(eventForm.end),
      type: eventForm.type,
      status: eventForm.status,
      notes: eventForm.notes,
      customerId,
      providerId,
    };

    try {
      if (isEditing && selectedEvent) {
        await updateEvent(selectedEvent.id, eventData);
      } else {
        await createEvent(eventData);
      }

      setShowEventDialog(false);
      resetForm();
    } catch (error) {
      // Error handling is already done in the useCalendar hook
      console.error('Failed to save event:', error);
    }
  };

  const handleDeleteEvent = async () => {
    if (selectedEvent) {
      try {
        await deleteEvent(selectedEvent.id);
        setShowEventDialog(false);
        resetForm();
      } catch (error) {
        // Error handling is already done in the useCalendar hook
        console.error('Failed to delete event:', error);
      }
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
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refreshEvents()}
              disabled={loading}
            >
              Refresh
            </Button>
            <Badge variant="outline" className="bg-blue-500 text-white">Booking</Badge>
            <Badge variant="outline" className="bg-purple-500 text-white">Available</Badge>
            <Badge variant="outline" className="bg-gray-500 text-white">Blocked</Badge>
          </div>
        </div>
        {error && (
          <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">Error loading calendar: {error}</p>
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        <div style={{ height: '600px' }}>
          {loading && calendarEvents.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                <p className="text-sm text-gray-600">Loading calendar events...</p>
              </div>
            </div>
          ) : (
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
          )}
        </div>

        {/* Event Dialog */}
        <Dialog open={showEventDialog} onOpenChange={setShowEventDialog}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {isEditing ? 'Edit Event' : 'Create New Event'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={eventForm.title}
                  onChange={(e) => setEventForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Event title"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Start</label>
                  <Input
                    type="datetime-local"
                    value={eventForm.start}
                    onChange={(e) => setEventForm(prev => ({ ...prev, start: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">End</label>
                  <Input
                    type="datetime-local"
                    value={eventForm.end}
                    onChange={(e) => setEventForm(prev => ({ ...prev, end: e.target.value }))}
                    required
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
                    <Button 
                      type="button"
                      variant="destructive" 
                      onClick={handleDeleteEvent}
                      disabled={loading}
                    >
                      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Delete Event'}
                    </Button>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={() => setShowEventDialog(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      isEditing ? 'Update' : 'Create'
                    )} Event
                  </Button>
                </div>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default SchedulingCalendar;