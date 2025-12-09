import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getServiceOrders, getTechnicians, getLocations, scheduleOrder, updateServiceOrder } from '../../services/fieldService';
import { Timestamp } from 'firebase/firestore';
import './Calendar.css';

const Calendar = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('resource'); // 'month', 'week', 'day', 'resource'
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [clickedTimeSlot, setClickedTimeSlot] = useState(null);
  const [selectedTechnicians, setSelectedTechnicians] = useState([]); // For filtering technicians
  const [draggedOrder, setDraggedOrder] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [dragOverSlot, setDragOverSlot] = useState(null);
  const [unscheduledOrders, setUnscheduledOrders] = useState([]);
  const [showJobCards, setShowJobCards] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [ordersList, techsList, locationsList] = await Promise.all([
        getServiceOrders(),
        getTechnicians(),
        getLocations()
      ]);
      const scheduled = ordersList.filter(o => o.scheduledDateStart);
      const unscheduled = ordersList.filter(o => !o.scheduledDateStart);
      setOrders(scheduled);
      setUnscheduledOrders(unscheduled);
      setTechnicians(techsList);
      setLocations(locationsList);
    } catch (error) {
      console.error('Error loading calendar data:', error);
    } finally {
      setLoading(false);
    }
  };

  const normalizeDate = (date) => {
    if (!date) return null;
    if (date.toDate) return date.toDate();
    if (date instanceof Timestamp) return date.toDate();
    return new Date(date);
  };

  const getEventsForDate = (date) => {
    return orders.filter(order => {
      const orderDate = normalizeDate(order.scheduledDateStart);
      if (!orderDate) return false;
      return orderDate.toDateString() === date.toDateString();
    });
  };

  const getEventsForTimeRange = (date, startHour = 0, endHour = 24) => {
    return orders.filter(order => {
      const orderDate = normalizeDate(order.scheduledDateStart);
      if (!orderDate) return false;
      const orderHour = orderDate.getHours();
      return orderDate.toDateString() === date.toDateString() && 
             orderHour >= startHour && orderHour < endHour;
    });
  };

  const getEventsForTechnician = (technicianId, date) => {
    return orders.filter(order => {
      if (order.personId !== technicianId) return false;
      const orderDate = normalizeDate(order.scheduledDateStart);
      if (!orderDate) return false;
      return orderDate.toDateString() === date.toDateString();
    });
  };

  const formatTime = (date) => {
    if (!date) return '';
    const d = normalizeDate(date);
    if (!d) return '';
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const getEventColor = (order) => {
    const priority = order.priority || '0';
    const status = order.status || 'pending';
    
    if (status === 'completed') return '#34c759';
    if (status === 'in-progress') return '#007aff';
    if (priority === '3' || priority === 3) return '#ff3b30'; // Urgent
    if (priority === '2' || priority === 2) return '#ff9500'; // High
    if (priority === '1' || priority === 1) return '#ffcc00'; // Low
    return '#5ac8fa'; // Normal/Default
  };

  const getEventDuration = (order) => {
    const duration = order.scheduledDuration || 1;
    return duration;
  };

  const getEventPosition = (order) => {
    const startDate = normalizeDate(order.scheduledDateStart);
    if (!startDate) return { top: 0, height: 60 };
    
    const hour = startDate.getHours();
    const minute = startDate.getMinutes();
    const duration = getEventDuration(order);
    
    const top = (hour * 60 + minute) * (60 / 60); // 60px per hour
    const height = duration * 60; // 60px per hour
    
    return { top, height };
  };

  const navigateDate = (direction) => {
    const newDate = new Date(currentDate);
    if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() + direction);
    } else if (viewMode === 'week' || viewMode === 'resource') {
      newDate.setDate(newDate.getDate() + (direction * 7));
    } else {
      newDate.setDate(newDate.getDate() + direction);
    }
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const getWeekDates = () => {
    const dates = [];
    const startOfWeek = new Date(currentDate);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day;
    startOfWeek.setDate(diff);
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const getMonthDates = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    // Previous month days
    const prevMonth = new Date(year, month - 1, 0);
    const prevMonthDays = prevMonth.getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push(new Date(year, month - 1, prevMonthDays - i));
    }
    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    // Next month days to fill grid
    const remaining = 42 - days.length;
    for (let day = 1; day <= remaining; day++) {
      days.push(new Date(year, month + 1, day));
    }
    return days;
  };

  const handleTimeSlotClick = (date, hour) => {
    const clickedDate = new Date(date);
    clickedDate.setHours(hour, 0, 0, 0);
    setClickedTimeSlot(clickedDate);
    setShowCreateModal(true);
  };

  const handleDragStart = (e, order) => {
    setDraggedOrder(order);
    setDragging(true);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', order.id);
    e.currentTarget.style.opacity = '0.5';
  };

  const handleDragEnd = (e) => {
    setDragging(false);
    setDraggedOrder(null);
    setDragOverSlot(null);
    e.currentTarget.style.opacity = '1';
  };

  const handleDragOver = (e, date, hour, technicianId = null) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverSlot({ date, hour, technicianId });
  };

  const handleDrop = async (e, date, hour, technicianId = null) => {
    e.preventDefault();
    if (!draggedOrder) return;

    try {
      const dropDate = new Date(date);
      dropDate.setHours(hour, 0, 0, 0);
      
      // Schedule the order
      await scheduleOrder(
        draggedOrder.id,
        dropDate,
        draggedOrder.scheduledDuration || 1
      );

      // If dropping on a technician, assign them
      if (technicianId && draggedOrder.personId !== technicianId) {
        await updateServiceOrder(draggedOrder.id, {
          personId: technicianId,
          person_id: technicianId
        });
      }

      // Reload data
      loadData();
    } catch (error) {
      console.error('Error scheduling order:', error);
      alert('Error scheduling order. Please try again.');
    } finally {
      setDragging(false);
      setDraggedOrder(null);
      setDragOverSlot(null);
    }
  };

  const handleResizeStart = (e, order, edge) => {
    e.stopPropagation();
    // Resize functionality can be added here
  };

  const handleEventClick = (order) => {
    setSelectedEvent(order);
    setShowEventModal(true);
  };

  const renderMonthView = () => {
    const days = getMonthDates();
    const today = new Date();
    
    return (
      <div className="calendar-month-view">
        <div className="calendar-weekdays">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="calendar-weekday">{day}</div>
          ))}
        </div>
        <div className="calendar-month-grid">
          {days.map((date, idx) => {
            const isToday = date.toDateString() === today.toDateString();
            const isCurrentMonth = date.getMonth() === currentDate.getMonth();
            const events = getEventsForDate(date);
            
            return (
              <div 
                key={idx} 
                className={`calendar-month-day ${isToday ? 'today' : ''} ${!isCurrentMonth ? 'other-month' : ''}`}
                onClick={() => {
                  setCurrentDate(new Date(date));
                  setViewMode('day');
                }}
              >
                <div className="calendar-day-number">{date.getDate()}</div>
                <div className="calendar-day-events">
                  {events.slice(0, 3).map(order => (
                    <div
                      key={order.id}
                      className="calendar-event-month"
                      style={{ backgroundColor: getEventColor(order) }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEventClick(order);
                      }}
                      title={`${order.name || 'Order'} - ${formatTime(order.scheduledDateStart)}`}
                    >
                      {formatTime(order.scheduledDateStart)} {order.name || order.id}
                    </div>
                  ))}
                  {events.length > 3 && (
                    <div className="calendar-more-events">+{events.length - 3} more</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    const weekDates = getWeekDates();
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const today = new Date();
    
    return (
      <div className="calendar-week-view">
        <div className="calendar-week-header">
          <div className="calendar-time-column"></div>
          {weekDates.map((date, idx) => {
            const isToday = date.toDateString() === today.toDateString();
            return (
              <div key={idx} className={`calendar-week-day-header ${isToday ? 'today' : ''}`}>
                <div className="week-day-name">{date.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                <div className="week-day-number">{date.getDate()}</div>
              </div>
            );
          })}
        </div>
        <div className="calendar-week-body">
          <div className="calendar-time-column">
            {hours.map(hour => (
              <div key={hour} className="calendar-hour-label">
                {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
              </div>
            ))}
          </div>
          <div className="calendar-week-days">
            {weekDates.map((date, dayIdx) => (
              <div key={dayIdx} className="calendar-week-day">
                {hours.map(hour => {
                  const slotDate = new Date(date);
                  slotDate.setHours(hour, 0, 0, 0);
                  const events = getEventsForTimeRange(date, hour, hour + 1);
                  
                  return (
                    <div
                      key={hour}
                      className="calendar-time-slot"
                      onClick={() => handleTimeSlotClick(date, hour)}
                    >
                      {events.map(order => {
                        const pos = getEventPosition(order);
                        const startDate = normalizeDate(order.scheduledDateStart);
                        if (!startDate || startDate.getHours() !== hour) return null;
                        
                          return (
                            <div
                              key={order.id}
                              className="calendar-event-week"
                              style={{
                                backgroundColor: getEventColor(order),
                                top: `${pos.top}px`,
                                height: `${pos.height}px`,
                              }}
                              draggable
                              onDragStart={(e) => handleDragStart(e, order)}
                              onDragEnd={handleDragEnd}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEventClick(order);
                              }}
                            >
                            <div className="event-time">{formatTime(order.scheduledDateStart)}</div>
                            <div className="event-title">{order.name || 'Service Order'}</div>
                            {order.personId && (
                              <div className="event-technician">
                                {technicians.find(t => t.id === order.personId)?.name || 'Unassigned'}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderResourceView = () => {
    const weekDates = getWeekDates();
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const today = new Date();
    
    // Filter technicians if selection is active
    const displayTechnicians = selectedTechnicians.length > 0 
      ? technicians.filter(t => selectedTechnicians.includes(t.id))
      : technicians;
    
    return (
      <div className="calendar-resource-view">
        <div className="calendar-resource-header">
          <div className="calendar-resource-time-column"></div>
          {weekDates.map((date, idx) => {
            const isToday = date.toDateString() === today.toDateString();
            return (
              <div key={idx} className={`calendar-resource-day-header ${isToday ? 'today' : ''}`}>
                <div className="resource-day-name">{date.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                <div className="resource-day-number">{date.getDate()}</div>
              </div>
            );
          })}
        </div>
        <div className="calendar-resource-body">
          <div className="calendar-resource-time-column">
            {hours.map(hour => (
              <div key={hour} className="calendar-hour-label">
                {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
              </div>
            ))}
          </div>
          <div className="calendar-resource-rows">
            {displayTechnicians.map(technician => (
              <div key={technician.id} className="calendar-resource-row">
                <div className="calendar-resource-label">
                  <div className="resource-avatar">
                    {technician.name ? technician.name.substring(0, 2).toUpperCase() : 'T'}
                  </div>
                  <div className="resource-info">
                    <div className="resource-name">{technician.name || 'Unnamed Technician'}</div>
                    {technician.role && (
                      <div className="resource-role">{technician.role}</div>
                    )}
                  </div>
                </div>
                <div className="calendar-resource-timeline">
                  {weekDates.map((date, dayIdx) => (
                    <div key={dayIdx} className="calendar-resource-day">
                      {hours.map(hour => {
                        const slotDate = new Date(date);
                        slotDate.setHours(hour, 0, 0, 0);
                        const events = getEventsForTechnician(technician.id, date).filter(order => {
                          const orderDate = normalizeDate(order.scheduledDateStart);
                          if (!orderDate) return false;
                          const orderHour = orderDate.getHours();
                          return orderHour >= hour && orderHour < hour + 1;
                        });
                        
                        const isDragOver = dragOverSlot?.date?.toDateString() === date.toDateString() && 
                                          dragOverSlot?.hour === hour &&
                                          dragOverSlot?.technicianId === technician.id;
                        
                        return (
                          <div
                            key={hour}
                            className={`calendar-time-slot ${isDragOver ? 'drag-over' : ''}`}
                            onClick={() => handleTimeSlotClick(date, hour)}
                            onDragOver={(e) => handleDragOver(e, date, hour, technician.id)}
                            onDrop={(e) => handleDrop(e, date, hour, technician.id)}
                          >
                            {events.map(order => {
                              const pos = getEventPosition(order);
                              const startDate = normalizeDate(order.scheduledDateStart);
                              if (!startDate || startDate.getHours() !== hour) return null;
                              
                              return (
                                <div
                                  key={order.id}
                                  className="calendar-event-resource"
                                  style={{
                                    backgroundColor: getEventColor(order),
                                    top: `${pos.top}px`,
                                    height: `${pos.height}px`,
                                  }}
                                  draggable
                                  onDragStart={(e) => handleDragStart(e, order)}
                                  onDragEnd={handleDragEnd}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEventClick(order);
                                  }}
                                >
                                  <div className="event-time">{formatTime(order.scheduledDateStart)}</div>
                                  <div className="event-title">{order.name || 'Service Order'}</div>
                                  {order.locationId && (
                                    <div className="event-location">
                                      {locations.find(l => l.id === order.locationId)?.name || 'Location'}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderDayView = () => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const today = new Date();
    const isToday = currentDate.toDateString() === today.toDateString();
    
    return (
      <div className="calendar-day-view">
        <div className="calendar-day-header">
          <div className="calendar-time-column"></div>
          <div className={`calendar-day-header-main ${isToday ? 'today' : ''}`}>
            <div className="day-name">{currentDate.toLocaleDateString('en-US', { weekday: 'long' })}</div>
            <div className="day-date">{currentDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
          </div>
        </div>
        <div className="calendar-day-body">
          <div className="calendar-time-column">
            {hours.map(hour => (
              <div key={hour} className="calendar-hour-label">
                {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
              </div>
            ))}
          </div>
          <div className="calendar-day-timeline">
            {hours.map(hour => {
              const slotDate = new Date(currentDate);
              slotDate.setHours(hour, 0, 0, 0);
              const events = getEventsForTimeRange(currentDate, hour, hour + 1);
              
              const isDragOver = dragOverSlot?.date?.toDateString() === currentDate.toDateString() && 
                                dragOverSlot?.hour === hour;
              
              return (
                <div
                  key={hour}
                  className={`calendar-time-slot ${isDragOver ? 'drag-over' : ''}`}
                  onClick={() => handleTimeSlotClick(currentDate, hour)}
                  onDragOver={(e) => handleDragOver(e, currentDate, hour)}
                  onDrop={(e) => handleDrop(e, currentDate, hour)}
                >
                  {events.map(order => {
                    const pos = getEventPosition(order);
                    const startDate = normalizeDate(order.scheduledDateStart);
                    if (!startDate || startDate.getHours() !== hour) return null;
                    
                      return (
                        <div
                          key={order.id}
                          className="calendar-event-day"
                          style={{
                            backgroundColor: getEventColor(order),
                            top: `${pos.top}px`,
                            height: `${pos.height}px`,
                          }}
                          draggable
                          onDragStart={(e) => handleDragStart(e, order)}
                          onDragEnd={handleDragEnd}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEventClick(order);
                          }}
                        >
                        <div className="event-time">{formatTime(order.scheduledDateStart)}</div>
                        <div className="event-title">{order.name || 'Service Order'}</div>
                        {order.description && (
                          <div className="event-description">{order.description}</div>
                        )}
                        {order.personId && (
                          <div className="event-technician">
                            {technicians.find(t => t.id === order.personId)?.name || 'Unassigned'}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="calendar-loading">
        <div className="loading-spinner"></div>
        <p>Loading calendar...</p>
      </div>
    );
  }

  return (
    <div className="calendar-container">
      <div className="calendar-toolbar">
        <div className="calendar-toolbar-left">
          <button className="calendar-btn-primary" onClick={() => setShowCreateModal(true)}>
            <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Create
          </button>
          <div className="calendar-view-toggle">
            <button
              className={viewMode === 'resource' ? 'active' : ''}
              onClick={() => setViewMode('resource')}
            >
              Resource
            </button>
            <button
              className={viewMode === 'month' ? 'active' : ''}
              onClick={() => setViewMode('month')}
            >
              Month
            </button>
            <button
              className={viewMode === 'week' ? 'active' : ''}
              onClick={() => setViewMode('week')}
            >
              Week
            </button>
            <button
              className={viewMode === 'day' ? 'active' : ''}
              onClick={() => setViewMode('day')}
            >
              Day
            </button>
          </div>
          {viewMode === 'resource' && (
            <div className="calendar-resource-filters">
              <button
                className={`calendar-filter-btn ${selectedTechnicians.length === 0 ? 'active' : ''}`}
                onClick={() => setSelectedTechnicians([])}
              >
                All Technicians
              </button>
              {technicians.map(tech => (
                <button
                  key={tech.id}
                  className={`calendar-filter-btn ${selectedTechnicians.includes(tech.id) ? 'active' : ''}`}
                  onClick={() => {
                    if (selectedTechnicians.includes(tech.id)) {
                      setSelectedTechnicians(selectedTechnicians.filter(id => id !== tech.id));
                    } else {
                      setSelectedTechnicians([...selectedTechnicians, tech.id]);
                    }
                  }}
                >
                  {tech.name || 'Unnamed'}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="calendar-toolbar-center">
          <button className="calendar-nav-btn" onClick={() => navigateDate(-1)}>
            <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button className="calendar-today-btn" onClick={goToToday}>
            Today
          </button>
          <button className="calendar-nav-btn" onClick={() => navigateDate(1)}>
            <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <div className="calendar-date-display">
            {viewMode === 'month' && currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            {(viewMode === 'week' || viewMode === 'resource') && (() => {
              const weekDates = getWeekDates();
              const start = weekDates[0];
              const end = weekDates[6];
              return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
            })()}
            {viewMode === 'day' && currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </div>
        </div>
        <div className="calendar-toolbar-right">
          <button className="calendar-btn-icon" title="Settings">
            <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </div>

      <div className="calendar-content">
        {viewMode === 'resource' && renderResourceView()}
        {viewMode === 'month' && renderMonthView()}
        {viewMode === 'week' && renderWeekView()}
        {viewMode === 'day' && renderDayView()}
      </div>

      {/* Event Detail Modal */}
      {showEventModal && selectedEvent && (
        <div className="calendar-modal-overlay" onClick={() => setShowEventModal(false)}>
          <div className="calendar-modal" onClick={(e) => e.stopPropagation()}>
            <div className="calendar-modal-header">
              <h3>{selectedEvent.name || 'Service Order'}</h3>
              <button onClick={() => setShowEventModal(false)}>×</button>
            </div>
            <div className="calendar-modal-body">
              <div className="event-detail-item">
                <label>Time:</label>
                <span>{formatTime(selectedEvent.scheduledDateStart)}</span>
              </div>
              {selectedEvent.description && (
                <div className="event-detail-item">
                  <label>Description:</label>
                  <span>{selectedEvent.description}</span>
                </div>
              )}
              {selectedEvent.personId && (
                <div className="event-detail-item">
                  <label>Technician:</label>
                  <span>{technicians.find(t => t.id === selectedEvent.personId)?.name || 'Unassigned'}</span>
                </div>
              )}
              <div className="event-detail-item">
                <label>Status:</label>
                <span className={`status-badge status-${selectedEvent.status || 'pending'}`}>
                  {selectedEvent.status || 'pending'}
                </span>
              </div>
              <div className="event-detail-item">
                <label>Priority:</label>
                <span className={`priority-badge priority-${selectedEvent.priority || '0'}`}>
                  {selectedEvent.priority === '3' || selectedEvent.priority === 3 ? 'Urgent' :
                   selectedEvent.priority === '2' || selectedEvent.priority === 2 ? 'High' :
                   selectedEvent.priority === '1' || selectedEvent.priority === 1 ? 'Low' : 'Normal'}
                </span>
              </div>
            </div>
            <div className="calendar-modal-footer">
              <button className="calendar-btn-secondary" onClick={() => setShowEventModal(false)}>
                Close
              </button>
              <button 
                className="calendar-btn-primary" 
                onClick={() => {
                  setShowEventModal(false);
                  navigate(`/admin/orders`);
                }}
              >
                View Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Event Modal */}
      {showCreateModal && (
        <div className="calendar-modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="calendar-modal" onClick={(e) => e.stopPropagation()}>
            <div className="calendar-modal-header">
              <h3>Create Service Order</h3>
              <button onClick={() => setShowCreateModal(false)}>×</button>
            </div>
            <div className="calendar-modal-body">
              <p className="calendar-modal-info">
                Clicking a time slot will create a new service order at that time.
                Use the Service Orders page to create orders with full details.
              </p>
            </div>
            <div className="calendar-modal-footer">
              <button className="calendar-btn-secondary" onClick={() => setShowCreateModal(false)}>
                Cancel
              </button>
              <button 
                className="calendar-btn-primary" 
                onClick={() => {
                  setShowCreateModal(false);
                  navigate('/admin/orders');
                }}
              >
                Go to Service Orders
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;
