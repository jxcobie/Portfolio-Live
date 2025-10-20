'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Mail, User, CheckCircle2, AlertCircle, Zap } from 'lucide-react';

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
    { value: '30min', label: '30 MIN SESSION', duration: 30 },
    { value: '60min', label: '60 MIN SESSION', duration: 60 },
    { value: '90min', label: '90 MIN SESSION', duration: 90 },
  ];

  // Get CMS URL with fallback
  const CMS_URL = process.env.NEXT_PUBLIC_CMS_URL || 'http://localhost:1337';

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
      const duration = meetingTypes.find((t) => t.value === formData.meetingType)?.duration || 30;

      const response = await fetch(
        `${CMS_URL}/api/bookings/availability/${dateStr}?duration=${duration}`
      );

      if (!response.ok) throw new Error('Failed to fetch availability');

      const data = await response.json();
      setAvailability(data);
    } catch (err) {
      console.error('Error fetching availability:', err);
      setError('❌ CONNECTION_FAILED: Unable to reach booking server');
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
        duration: meetingTypes.find((t) => t.value === formData.meetingType)?.duration || 30,
      };

      const response = await fetch(`${CMS_URL}/api/bookings`, {
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
      setError(`❌ BOOKING_FAILED: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const days = getDaysInMonth(currentMonth);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const monthNames = [
    'JANUARY',
    'FEBRUARY',
    'MARCH',
    'APRIL',
    'MAY',
    'JUNE',
    'JULY',
    'AUGUST',
    'SEPTEMBER',
    'OCTOBER',
    'NOVEMBER',
    'DECEMBER',
  ];
  const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  if (submitted) {
    return (
      <section className="content-section flex min-h-screen items-center justify-center">
        <div className="w-full max-w-2xl">
          <div className="glowing-border bg-dark-500/80 rounded-lg p-12 text-center backdrop-blur-sm">
            <div className="text-success mb-6 flex justify-center">
              <CheckCircle2 className="h-20 w-20 animate-pulse" />
            </div>
            <h2 className="text-success mb-4 font-mono text-3xl font-bold">
              [ BOOKING_CONFIRMED ]
            </h2>
            <div className="text-cyber-cyan space-y-3 font-mono">
              <p>
                <span className="text-gray-400">DATE:</span> {selectedDate?.toLocaleDateString()}
              </p>
              <p>
                <span className="text-gray-400">TIME:</span> {selectedTime}
              </p>
              <p>
                <span className="text-gray-400">EMAIL:</span> {formData.email}
              </p>
            </div>
            <div className="bg-success/10 border-success/30 mt-8 rounded border p-4">
              <p className="text-success font-mono text-sm">
                ✓ Confirmation email sent to your inbox
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="px-4 py-12 sm:px-6 md:py-20 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-12 text-center md:mb-16">
          <div className="inline-block">
            <div className="mb-6 flex items-center justify-center gap-4">
              <Zap className="text-cyber-cyan h-10 w-10 animate-pulse md:h-12 md:w-12" />
              <h1 className="text-cyber-cyan font-mono text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
                [ BOOK_SESSION ]
              </h1>
              <Zap className="text-cyber-magenta h-10 w-10 animate-pulse md:h-12 md:w-12" />
            </div>
            <p className="font-mono text-sm text-gray-400 md:text-base">
              &gt; Initialize meeting protocol...
            </p>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mx-auto mb-8 max-w-4xl">
            <div className="bg-error/10 border-error/50 flex items-start gap-3 rounded-lg border-2 p-4">
              <AlertCircle className="text-error mt-0.5 h-6 w-6 flex-shrink-0" />
              <div className="text-error font-mono text-sm">{error}</div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="glowing-border bg-dark-500/50 overflow-hidden rounded-xl shadow-2xl backdrop-blur-sm">
          <div className="divide-cyber-cyan/20 grid gap-0 divide-y lg:grid-cols-2 lg:divide-x lg:divide-y-0">
            {/* Left Column - Calendar & Time Selection */}
            <div className="space-y-8 p-6 sm:p-8 lg:p-10">
              {/* Meeting Type Selector */}
              <div>
                <label className="text-cyber-cyan mb-4 block font-mono text-sm font-semibold">
                  [ SELECT_DURATION ]
                </label>
                <div className="space-y-3">
                  {meetingTypes.map((type) => (
                    <button
                      key={type.value}
                      onClick={() => setFormData({ ...formData, meetingType: type.value })}
                      className={`w-full rounded p-4 font-mono text-sm transition-all ${
                        formData.meetingType === type.value
                          ? 'bg-cyber-cyan/20 border-cyber-cyan text-cyber-cyan shadow-glow border-2'
                          : 'bg-dark-400/50 hover:border-cyber-cyan/50 border border-gray-700 text-gray-400'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>[ {type.label} ]</span>
                        <Clock className="h-5 w-5" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Calendar */}
              <div>
                <div className="mb-6 flex items-center justify-between">
                  <button
                    onClick={() =>
                      setCurrentMonth(
                        new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)
                      )
                    }
                    className="bg-dark-400 border-cyber-cyan/30 text-cyber-cyan hover:bg-cyber-cyan/20 rounded border px-4 py-2 font-mono transition-all"
                  >
                    ◄
                  </button>
                  <h3 className="font-mono text-xl font-bold text-white">
                    {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                  </h3>
                  <button
                    onClick={() =>
                      setCurrentMonth(
                        new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)
                      )
                    }
                    className="bg-dark-400 border-cyber-cyan/30 text-cyber-cyan hover:bg-cyber-cyan/20 rounded border px-4 py-2 font-mono transition-all"
                  >
                    ►
                  </button>
                </div>

                <div className="grid grid-cols-7 gap-2">
                  {dayNames.map((day) => (
                    <div
                      key={day}
                      className="text-cyber-magenta py-2 text-center font-mono text-xs font-bold"
                    >
                      {day}
                    </div>
                  ))}

                  {days.map((date, idx) => {
                    const isAvailable = isDateAvailable(date);
                    const isSelected =
                      selectedDate && date && date.toDateString() === selectedDate.toDateString();

                    return (
                      <button
                        key={idx}
                        onClick={() => date && isAvailable && setSelectedDate(date)}
                        disabled={!isAvailable}
                        className={`aspect-square rounded p-2 font-mono text-sm font-bold transition-all ${
                          !date
                            ? 'invisible'
                            : !isAvailable
                              ? 'bg-dark-400/30 cursor-not-allowed text-gray-700'
                              : isSelected
                                ? 'bg-cyber-cyan shadow-glow border-cyber-cyan border-2 text-black'
                                : 'bg-dark-400/50 hover:bg-cyber-cyan/20 hover:border-cyber-cyan border border-gray-700 text-gray-300'
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
                <div className="border-cyber-cyan/30 bg-dark-400/30 rounded-lg border-2 p-6">
                  <h4 className="text-cyber-cyan mb-4 font-mono text-sm font-bold">
                    [{' '}
                    {selectedDate
                      .toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })
                      .toUpperCase()}{' '}
                    ]
                  </h4>

                  {loadingAvailability ? (
                    <div className="py-8 text-center">
                      <div className="border-cyber-cyan/30 border-t-cyber-cyan mx-auto h-12 w-12 animate-spin rounded-full border-4"></div>
                      <p className="mt-4 font-mono text-sm text-gray-400">LOADING_SLOTS...</p>
                    </div>
                  ) : availability && !availability.isAvailable ? (
                    <div className="py-8 text-center">
                      <AlertCircle className="text-warning mx-auto mb-3 h-12 w-12" />
                      <p className="font-mono text-gray-300">[ NO_AVAILABILITY ]</p>
                      {availability.reason && (
                        <p className="mt-2 font-mono text-sm text-gray-500">
                          {availability.reason}
                        </p>
                      )}
                    </div>
                  ) : availability && availability.workingHours.length > 0 ? (
                    <div className="space-y-4">
                      <div className="font-mono text-sm">
                        <div className="text-cyber-magenta mb-2">WORKING_HOURS:</div>
                        {availability.workingHours.map((wh, idx) => (
                          <div key={idx} className="ml-4 text-gray-400">
                            &gt; {wh.start} - {wh.end}
                          </div>
                        ))}
                      </div>
                      <div className="font-mono text-sm">
                        <span className="text-cyber-magenta">SLOTS_AVAILABLE:</span>{' '}
                        <span className="text-cyber-cyan">
                          {availability.availableSlots.length}
                        </span>
                      </div>
                      {availability.bookedCount > 0 && (
                        <div className="font-mono text-sm">
                          <span className="text-gray-500">BOOKED:</span> {availability.bookedCount}
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>
              )}

              {/* Time Slots */}
              {availability && availability.availableSlots.length > 0 && (
                <div>
                  <h4 className="text-cyber-cyan mb-4 flex items-center gap-2 font-mono text-sm font-bold">
                    <Clock className="h-5 w-5" />[ SELECT_TIME ]
                  </h4>
                  <div className="custom-scrollbar grid max-h-60 grid-cols-3 gap-2 overflow-y-auto">
                    {availability.availableSlots.map((time) => (
                      <button
                        key={time}
                        onClick={() => setSelectedTime(time)}
                        className={`rounded p-3 font-mono text-sm font-bold transition-all ${
                          selectedTime === time
                            ? 'bg-cyber-magenta shadow-glow-magenta border-cyber-magenta border-2 text-white'
                            : 'bg-dark-400/50 hover:bg-cyber-magenta/20 hover:border-cyber-magenta border border-gray-700 text-gray-400'
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Form */}
            <div className="p-6 sm:p-8 lg:p-10">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="text-cyber-cyan mb-2 block font-mono text-sm font-semibold">
                    <User className="mr-2 inline h-4 w-4" />[ FULL_NAME ]
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-dark-400/50 focus:border-cyber-cyan focus:shadow-glow w-full rounded border border-gray-700 px-4 py-3 font-mono text-white transition-all focus:outline-none"
                    placeholder="John_Doe"
                  />
                </div>

                <div>
                  <label className="text-cyber-cyan mb-2 block font-mono text-sm font-semibold">
                    <Mail className="mr-2 inline h-4 w-4" />[ EMAIL ]
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="bg-dark-400/50 focus:border-cyber-cyan focus:shadow-glow w-full rounded border border-gray-700 px-4 py-3 font-mono text-white transition-all focus:outline-none"
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <label className="text-cyber-cyan mb-2 block font-mono text-sm font-semibold">
                    [ PHONE ] <span className="text-xs text-gray-500">(OPTIONAL)</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="bg-dark-400/50 focus:border-cyber-cyan focus:shadow-glow w-full rounded border border-gray-700 px-4 py-3 font-mono text-white transition-all focus:outline-none"
                    placeholder="+1_555_000_0000"
                  />
                </div>

                <div>
                  <label className="text-cyber-cyan mb-2 block font-mono text-sm font-semibold">
                    [ MESSAGE ] <span className="text-xs text-gray-500">(OPTIONAL)</span>
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={4}
                    className="bg-dark-400/50 focus:border-cyber-cyan focus:shadow-glow custom-scrollbar w-full resize-none rounded border border-gray-700 px-4 py-3 font-mono text-white transition-all focus:outline-none"
                    placeholder="> Tell me about your project..."
                  />
                </div>

                {selectedDate && selectedTime && (
                  <div className="bg-cyber-blue/10 border-cyber-blue/50 rounded-lg border-2 p-4">
                    <div className="text-cyber-blue mb-3 font-mono text-sm font-bold">
                      [ BOOKING_SUMMARY ]
                    </div>
                    <div className="space-y-2 font-mono text-sm text-white">
                      <div className="flex items-start gap-2">
                        <Calendar className="text-cyber-blue mt-0.5 h-4 w-4 flex-shrink-0" />
                        <span>
                          {selectedDate.toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="text-cyber-blue h-4 w-4" />
                        {selectedTime} (
                        {meetingTypes.find((t) => t.value === formData.meetingType)?.duration} MIN)
                      </div>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!selectedDate || !selectedTime || loading}
                  className="from-cyber-cyan to-cyber-blue hover:shadow-glow w-full rounded-lg bg-gradient-to-r py-4 font-mono font-bold text-black transition-all disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:shadow-none"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="h-5 w-5 animate-spin rounded-full border-3 border-black/30 border-t-black" />
                      PROCESSING...
                    </span>
                  ) : (
                    '[ CONFIRM_BOOKING ]'
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Info Footer */}
        <div className="mt-12 text-center">
          <p className="font-mono text-sm text-gray-500 md:text-base">
            &gt; Booking system online | Response time: {'<'}5 minutes
          </p>
        </div>
      </div>
    </section>
  );
}
