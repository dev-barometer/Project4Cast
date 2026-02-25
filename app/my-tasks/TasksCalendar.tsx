'use client';

import { useState } from 'react';
import Link from 'next/link';

type Task = {
  id: string;
  title: string;
  dueDate: Date | null;
  job?: {
    id: string;
    jobNumber: string;
    title: string;
    brand?: {
      name: string;
      client?: {
        name: string;
      } | null;
    } | null;
  } | null;
  status: 'TODO' | 'IN_PROGRESS' | 'BLOCKED' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
};

type TasksCalendarProps = {
  tasks: Task[];
};

export default function TasksCalendar({ tasks }: TasksCalendarProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [startDate, setStartDate] = useState(() => {
    // Start from today
    const date = new Date(today);
    return date;
  });

  // Get tasks grouped by due date
  const tasksByDate = new Map<string, Task[]>();
  tasks.forEach(task => {
    if (task.dueDate) {
      const dueDate = task.dueDate instanceof Date ? task.dueDate : new Date(task.dueDate);
      // Normalize to midnight for consistent date comparison
      const normalizedDate = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
      const dateKey = `${normalizedDate.getFullYear()}-${String(normalizedDate.getMonth() + 1).padStart(2, '0')}-${String(normalizedDate.getDate()).padStart(2, '0')}`;
      if (!tasksByDate.has(dateKey)) {
        tasksByDate.set(dateKey, []);
      }
      tasksByDate.get(dateKey)!.push(task);
    }
  });

  // Generate 14 days (2 weeks) starting from startDate
  const calendarDays: Array<{ date: Date; isPast: boolean; tasks: Task[] }> = [];
  for (let i = 0; i < 14; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    const dateNormalized = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const isPast = dateNormalized < today;
    
    calendarDays.push({
      date,
      isPast,
      tasks: tasksByDate.get(dateKey) || [],
    });
  }

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 13);
  
  const formatDateRange = () => {
    const startMonth = monthNames[startDate.getMonth()];
    const endMonth = monthNames[endDate.getMonth()];
    if (startDate.getMonth() === endDate.getMonth()) {
      return `${startMonth} ${startDate.getDate()} - ${endDate.getDate()}, ${startDate.getFullYear()}`;
    } else {
      return `${startMonth} ${startDate.getDate()} - ${endMonth} ${endDate.getDate()}, ${startDate.getFullYear()}`;
    }
  };

  const goToPreviousPeriod = () => {
    const newStartDate = new Date(startDate);
    newStartDate.setDate(startDate.getDate() - 14);
    setStartDate(newStartDate);
  };

  const goToNextPeriod = () => {
    const newStartDate = new Date(startDate);
    newStartDate.setDate(startDate.getDate() + 14);
    setStartDate(newStartDate);
  };

  const goToToday = () => {
    const date = new Date(today);
    setStartDate(date);
  };

  return (
    <div style={{ backgroundColor: '#ffffff', borderRadius: 8, padding: 24, boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)' }}>
      {/* Calendar Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={goToPreviousPeriod}
            style={{
              background: 'none',
              border: '1px solid #e2e8f0',
              borderRadius: 6,
              padding: '6px 12px',
              cursor: 'pointer',
              fontSize: 14,
              color: '#4a5568',
            }}
          >
            ←
          </button>
          <h2 style={{ fontSize: 20, fontWeight: 600, color: '#2d3748', margin: 0, minWidth: 300, textAlign: 'center' }}>
            {formatDateRange()}
          </h2>
          <button
            onClick={goToNextPeriod}
            style={{
              background: 'none',
              border: '1px solid #e2e8f0',
              borderRadius: 6,
              padding: '6px 12px',
              cursor: 'pointer',
              fontSize: 14,
              color: '#4a5568',
            }}
          >
            →
          </button>
        </div>
        <button
          onClick={goToToday}
          style={{
            background: '#14B8A6',
            color: '#ffffff',
            border: 'none',
            borderRadius: 6,
            padding: '8px 16px',
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 500,
          }}
        >
          Today
        </button>
      </div>

      {/* Day Names Header */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 8 }}>
        {dayNames.map(day => (
          <div
            key={day}
            style={{
              textAlign: 'center',
              fontSize: 12,
              fontWeight: 600,
              color: '#718096',
              padding: '8px 4px',
            }}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
        {calendarDays.map((dayData, index) => {
          const dayDateNormalized = new Date(dayData.date.getFullYear(), dayData.date.getMonth(), dayData.date.getDate());
          const todayNormalized = new Date(today.getFullYear(), today.getMonth(), today.getDate());
          const isToday = dayDateNormalized.getTime() === todayNormalized.getTime();
          const isPast = dayData.isPast && !isToday;
          
          return (
            <div
              key={index}
              style={{
                minHeight: 140,
                border: `1px solid ${isToday ? '#14B8A6' : '#e2e8f0'}`,
                borderRadius: 6,
                padding: 8,
                backgroundColor: isToday ? '#f0fdfa' : '#ffffff',
                opacity: isPast ? 0.6 : 1,
              }}
            >
              {/* Date Number */}
              <div
                style={{
                  fontSize: 14,
                  fontWeight: isToday ? 600 : 400,
                  color: isToday ? '#14B8A6' : isPast ? '#a0aec0' : '#2d3748',
                  marginBottom: 6,
                }}
              >
                {dayNames[dayData.date.getDay()]} {dayData.date.getDate()}
              </div>
              
              {/* Job Numbers */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {dayData.tasks.slice(0, 6).map(task => {
                  const isOverdue = isPast && task.status !== 'DONE';
                  const jobNumber = task.job?.jobNumber || 'No Job';
                  
                  return (
                    <Link
                      key={task.id}
                      href={task.job ? `/jobs/${task.job.id}` : '/tasks'}
                      style={{
                        fontSize: 11,
                        fontWeight: 500,
                        color: isOverdue ? '#f56565' : '#4299e1',
                        textDecoration: 'none',
                        padding: '3px 6px',
                        borderRadius: 4,
                        backgroundColor: isOverdue ? '#fed7d7' : '#e6f2ff',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                      title={task.title}
                    >
                      {jobNumber}
                    </Link>
                  );
                })}
                {dayData.tasks.length > 6 && (
                  <div style={{ fontSize: 10, color: '#a0aec0', padding: '2px 4px' }}>
                    +{dayData.tasks.length - 6} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
