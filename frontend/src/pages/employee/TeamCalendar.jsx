import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import api from '../../services/api';
import Loading from '../../components/Loading';

const TeamCalendar = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCalendarData = async () => {
      try {
        const [leavesRes, holidaysRes] = await Promise.all([
          api.get('/leaves?status=approved&limit=100'),
          api.get('/holidays')
        ]);

        const calendarEvents = [];

        (leavesRes.data.data || []).forEach((l) => {
          calendarEvents.push({
            id: l._id,
            title: `${l.employee?.name || 'Employee'} (${l.leaveType?.name || 'Leave'})`,
            start: l.startDate.split('T')[0],
            end: l.endDate.split('T')[0],
            backgroundColor: '#4f46e5',
            borderColor: '#4338ca'
          });
        });

        (holidaysRes.data.data || []).forEach((h) => {
          calendarEvents.push({
            id: h._id,
            title: `🎉 ${h.name}`,
            start: h.date.split('T')[0],
            backgroundColor: '#10b981',
            borderColor: '#059669',
            allDay: true
          });
        });

        setEvents(calendarEvents);
      } catch (err) {
        console.error('Failed to load calendar events:', err);
      } finally {
        setLoading(false);
      }
    };
    loadCalendarData();
  }, []);

  if (loading) return <Loading message="Loading Team Calendar..." />;

  return (
    <div className="space-y-4">
      <div>
        <h4 className="fw-bold text-primary mb-1">Team Calendar</h4>
        <p className="text-muted small mb-3">View team availability, approved leaves, and company holidays.</p>
      </div>

      <div className="glass-card p-4">
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={events}
          height="auto"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,dayGridWeek'
          }}
        />
      </div>
    </div>
  );
};

export default TeamCalendar;
