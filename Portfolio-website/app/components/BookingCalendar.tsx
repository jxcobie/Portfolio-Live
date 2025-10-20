'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Mail, User, CheckCircle2, AlertCircle } from 'lucide-react';

interface TimeSlot {
  time: string;
  available: boolean;
}

interface WorkingHours {
  start: string;
  end: string;
}

interface AvailabilityData {
  date: string;
  isAvailable: boolean;
  workingHours: WorkingHours[];
  availableSlots: string[];
  bookedCount: number;
  blockedCount: number;
  reason?: string;
}

export default function BookingCalendar() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [availability, setAvailability] = useState<AvailabilityData | null>(null);
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    meetingType: '30min',
    notes: '',
  });
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const meetingTypes = [
    { value: '30min', label: '30 Minutes', duration: 30 },
    { value: '60min', label: '1 Hour', duration: 60 },
    { value: '90min', label: '1.5 Hours', duration: 90 },
  ];

  // Fetch availability when date or meeting type changes
  useEffect(() => {
    if (selectedDate) {
      fetchAvailability(selectedDate);
    }
  }, [selectedDate, formData.meetingType]);

  const fetchAvailability = async (date: Date) => {
    setLoadingAvailability(true);
    setSelectedTime(null);
    setError(null);

    try {
      const dateStr = date.toISOString().split('T')[0];
      const duration = meetingTypes.find(t => t.value === formData.meetingType)?.duration || 30;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_CMS_URL}/api/bookings/availability/${dateStr}?duration=${duration}`
      );

      if (!response.ok) throw new Error('Failed to fetch availability');

      const data = await response.json();
      setAvailability(data);
    } catch (err) {
      console.error('Error fetching availability:', err);
      setError('Failed to load availability');
    } finally {
      setLoadingAvailability(false);
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: (Date | null)[] = [];

    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }

    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const isDateAvailable = (date: Date | null) => {
    if (!date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const day = date.getDay();
    return date >= today && day !== 0 && day !== 6;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !selectedTime) return;

    setLoading(true);
    setError(null);

    try {
      const bookingData = {
        ...formData,
        date: selectedDate.toISOString().split('T')[0],
        time: selectedTime,
        duration: meetingTypes.find(t => t.value === formData.meetingType)?.duration || 30,
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_CMS_URL}/api/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create booking');
      }

      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setSelectedDate(null);
        setSelectedTime(null);
        setFormData({
          name: '',
          email: '',
          phone: '',
          meetingType: '30min',
          notes: '',
        });
      }, 5000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const days = getDaysInMonth(currentMonth);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  if (submitted) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-8 text-center">
          <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Booking Confirmed!</h2>
          <p className="text-slate-300 mb-4">
            Your meeting has been scheduled for {selectedDate?.toLocaleDateString()} at {selectedTime}
          </p>
          <p className="text-slate-400">A confirmation email has been sent to {formData.email}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-500/20 to-blue-500/20 p-8 border-b border-slate-800">
          <h1 className="text-3xl font-bold text-white mb-2">Schedule a Meeting</h1>
          <p className="text-slate-300">Choose your preferred date and time</p>
        </div>

        {error && (
          <div className="mx-8 mt-8 bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <p className="text-red-300">{error}</p>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8 p-8">
          {/* Left Column - Calendar & Availability */}
          <div className="space-y-6">
            {/* Meeting Type Selector */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3">
                Meeting Duration
              </label>
              <div className="grid gap-3">
                {meetingTypes.map(type => (
                  <button
                    key={type.value}
                    onClick={() => setFormData({ ...formData, meetingType: type.value })}
                    className={`p-4 rounded-xl border transition-all text-left ${
                      formData.meetingType === type.value
                        ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                        : 'bg-slate-800/30 border-slate-700 text-slate-300 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold">{type.label}</div>
                        <div className="text-sm opacity-75">{type.duration} minutes</div>
                      </div>
                      <Clock className="w-5 h-5" />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Calendar */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() =>
                    setCurrentMonth(
                      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)
                    )
                  }
                  className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white transition"
                >
                  ←
                </button>
                <h3 className="text-lg font-semibold text-white">
                  {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </h3>
                <button
                  onClick={() =>
                    setCurrentMonth(
                      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)
                    )
                  }
                  className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white transition"
                >
                  →
                </button>
              </div>

              <div className="grid grid-cols-7 gap-2">
                {dayNames.map(day => (
                  <div
                    key={day}
                    className="text-center text-xs font-medium text-slate-400 py-2"
                  >
                    {day}
                  </div>
                ))}

                {days.map((date, idx) => {
                  const isAvailable = isDateAvailable(date);
                  const isSelected =
                    selectedDate &&
                    date &&
                    date.toDateString() === selectedDate.toDateString();

                  return (
                    <button
                      key={idx}
                      onClick={() => date && isAvailable && setSelectedDate(date)}
                      disabled={!isAvailable}
                      className={`aspect-square p-2 rounded-lg text-sm font-medium transition-all ${
                        !date
                          ? 'invisible'
                          : !isAvailable
                          ? 'bg-slate-800/20 text-slate-600 cursor-not-allowed'
                          : isSelected
                          ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                          : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700 border border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      {date?.getDate()}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Availability Display */}
            {selectedDate && (
              <div className="space-y-4">
                <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700">
                  <h4 className="text-sm font-semibold text-white mb-3">
                    {selectedDate.toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </h4>

                  {loadingAvailability ? (
                    <div className="text-center py-4">
                      <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto"></div>
                      <p className="text-slate-400 text-sm mt-2">Loading availability...</p>
                    </div>
                  ) : availability && !availability.isAvailable ? (
                    <div className="text-center py-4">
                      <AlertCircle className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                      <p className="text-slate-300">No availability on this day</p>
                      {availability.reason && (
                        <p className="text-slate-400 text-sm mt-1">{availability.reason}</p>
                      )}
                    </div>
                  ) : availability && availability.workingHours.length > 0 ? (
                    <div className="space-y-3">
                      <div className="text-sm text-slate-400">
                        <strong className="text-slate-300">Working Hours:</strong>
                        {availability.workingHours.map((wh, idx) => (
                          <div key={idx} className="ml-2">
                            {wh.start} - {wh.end}
                          </div>
                        ))}
                      </div>
                      <div className="text-sm text-slate-400">
                        <strong className="text-slate-300">Available Slots:</strong>{' '}
                        {availability.availableSlots.length} slots
                      </div>
                      {availability.bookedCount > 0 && (
                        <div className="text-sm text-slate-400">
                          Already booked: {availability.bookedCount} slots
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>

                {/* Time Slots */}
                {availability && availability.availableSlots.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Select Time
                    </h4>
                    <div className="grid grid-cols-3 gap-2 max-h-60 overflow-y-auto">
                      {availability.availableSlots.map(time => (
                        <button
                          key={time}
                          onClick={() => setSelectedTime(time)}
                          className={`p-3 rounded-lg text-sm font-medium transition-all ${
                            selectedTime === time
                              ? 'bg-blue-500 text-white shadow-lg'
                              : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700 border border-slate-700'
                          }`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column - Form */}
          <div>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  <User className="w-4 h-4 inline mr-2" />
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  <Mail className="w-4 h-4 inline mr-2" />
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Phone Number (Optional)
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                  placeholder="+1 (555) 000-0000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Meeting Notes (Optional)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none resize-none"
                  placeholder="Tell me about your project..."
                />
              </div>

              {selectedDate && selectedTime && (
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                  <div className="text-sm text-blue-300 font-medium mb-2">
                    Meeting Summary:
                  </div>
                  <div className="text-white space-y-1 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-blue-400" />
                      {selectedDate.toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-400" />
                      {selectedTime} (
                      {meetingTypes.find(t => t.value === formData.meetingType)?.duration}{' '}
                      minutes)
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={!selectedDate || !selectedTime || loading}
                className="w-full bg-gradient-to-r from-emerald-500 to-blue-500 text-white font-semibold py-4 rounded-xl hover:shadow-lg hover:shadow-emerald-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Scheduling...
                  </span>
                ) : (
                  'Confirm Booking'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
