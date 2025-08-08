import { useState, useEffect, useCallback } from 'react';
import { calendarApi } from '@/services/api';
import { toast } from '@/hooks/use-toast';

export interface CalendarEvent {
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

interface UseCalendarOptions {
  providerId?: string;
  customerId?: string;
  autoLoad?: boolean;
}

export const useCalendar = (options: UseCalendarOptions = {}) => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { providerId, customerId, autoLoad = true } = options;

  const loadEvents = useCallback(async (startDate?: string, endDate?: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await calendarApi.getEvents(startDate, endDate, providerId, customerId);
      
      // Transform API response to CalendarEvent format
      const transformedEvents = Array.isArray(response) ? response.map((event: any) => ({
        id: event.id,
        title: event.title || event.name,
        start: new Date(event.start || event.startDate),
        end: new Date(event.end || event.endDate),
        type: event.type || 'booking',
        status: event.status,
        customerId: event.customerId,
        providerId: event.providerId,
        serviceId: event.serviceId,
        notes: event.notes || event.description,
      })) : [];

      setEvents(transformedEvents);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load events';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      
      // Fallback to empty array on error
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [providerId, customerId]);

  const createEvent = useCallback(async (eventData: Omit<CalendarEvent, 'id'>) => {
    setLoading(true);
    setError(null);

    try {
      const response = await calendarApi.createEvent({
        title: eventData.title,
        start: eventData.start.toISOString(),
        end: eventData.end.toISOString(),
        type: eventData.type,
        status: eventData.status,
        customerId: eventData.customerId,
        providerId: eventData.providerId,
        serviceId: eventData.serviceId,
        notes: eventData.notes,
      });

      const newEvent: CalendarEvent = {
        id: response.id || `event_${Date.now()}`,
        ...eventData,
      };

      setEvents(prev => [...prev, newEvent]);
      
      toast({
        title: 'Success',
        description: 'Event created successfully',
      });

      return newEvent;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create event';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateEvent = useCallback(async (eventId: string, eventData: Partial<CalendarEvent>) => {
    setLoading(true);
    setError(null);

    try {
      await calendarApi.updateEvent(eventId, {
        title: eventData.title,
        start: eventData.start?.toISOString(),
        end: eventData.end?.toISOString(),
        type: eventData.type,
        status: eventData.status,
        customerId: eventData.customerId,
        providerId: eventData.providerId,
        serviceId: eventData.serviceId,
        notes: eventData.notes,
      });

      setEvents(prev => prev.map(event => 
        event.id === eventId ? { ...event, ...eventData } : event
      ));

      toast({
        title: 'Success',
        description: 'Event updated successfully',
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update event';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteEvent = useCallback(async (eventId: string) => {
    setLoading(true);
    setError(null);

    try {
      await calendarApi.deleteEvent(eventId);
      
      setEvents(prev => prev.filter(event => event.id !== eventId));
      
      toast({
        title: 'Success',
        description: 'Event deleted successfully',
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete event';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Load events on mount if autoLoad is enabled
  useEffect(() => {
    if (autoLoad) {
      loadEvents();
    }
  }, [autoLoad, loadEvents]);

  return {
    events,
    loading,
    error,
    loadEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    refreshEvents: () => loadEvents(),
  };
};