// ==================== BOOKINGS ADMIN COMPONENT ====================
// Add this to Portfolio-CMS/admin/index.html

// Bookings Manager Component (Complete)
function BookingsManager() {
  const [bookings, setBookings] = React.useState([]);
  const [filter, setFilter] = React.useState('upcoming');
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    loadBookings();
  }, [filter]);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const query = filter === 'upcoming' ? '?upcoming=true' : `?status=${filter}`;
      const res = await fetch(`/api/bookings${query}`);
      const data = await res.json();
      setBookings(data.data || []);
    } catch (error) {
      console.error('Failed to load bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    if (!confirm(`Mark this booking as ${status}?`)) return;
    
    try {
      await fetch(`/api/bookings/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      loadBookings();
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Failed to update booking status');
    }
  };

  const deleteBooking = async (id) => {
    if (!confirm('Delete this booking? This cannot be undone.')) return;
    
    try {
      await fetch(`/api/bookings/${id}`, { method: 'DELETE' });
      loadBookings();
    } catch (error) {
      console.error('Failed to delete booking:', error);
      alert('Failed to delete booking');
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'confirmed': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'completed': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'cancelled': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'no-show': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return e('div', { className: 'flex items-center justify-center py-20' },
      e('div', { className: 'text-center' },
        e('div', { className: 'w-16 h-16 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4' }),
        e('p', { className: 'text-slate-400' }, 'Loading bookings...')
      )
    );
  }

  return e('div', null,
    // Header with filters
    e('div', { className: 'flex justify-between items-center mb-8' },
      e('div', null,
        e('h2', { className: 'text-3xl font-bold text-white mb-2' }, '📅 Bookings'),
        e('p', { className: 'text-slate-400' }, 
          `${bookings.length} ${filter} ${bookings.length === 1 ? 'booking' : 'bookings'}`
        )
      ),
      e('div', { className: 'flex gap-2' },
        ['upcoming', 'confirmed', 'completed', 'cancelled', 'no-show'].map(f =>
          e('button', {
            key: f,
            onClick: () => setFilter(f),
            className: `px-4 py-2 rounded-lg capitalize transition-all ${
              filter === f
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`
          }, f.replace('-', ' '))
        )
      )
    ),

    // Bookings grid
    bookings.length === 0 ? (
      e('div', { className: 'text-center py-20' },
        e('div', { className: 'text-6xl mb-4' }, '📅'),
        e('h3', { className: 'text-xl font-semibold text-white mb-2' }, 'No Bookings Found'),
        e('p', { className: 'text-slate-400' }, 
          `No ${filter} bookings to display`
        )
      )
    ) : (
      e('div', { className: 'grid gap-4' },
        bookings.map(booking =>
          e('div', {
            key: booking.id,
            className: 'bg-slate-800/50 rounded-xl p-6 border border-slate-700 hover:border-slate-600 transition-all'
          },
            // Booking header
            e('div', { className: 'flex justify-between items-start mb-4' },
              e('div', null,
                e('h3', { className: 'text-xl font-semibold text-white mb-1' }, 
                  booking.name
                ),
                e('div', { className: 'flex items-center gap-2 text-sm' },
                  e('a', { 
                    href: `mailto:${booking.email}`,
                    className: 'text-emerald-400 hover:text-emerald-300'
                  }, booking.email),
                  booking.phone && e('span', { className: 'text-slate-500' }, '•'),
                  booking.phone && e('a', {
                    href: `tel:${booking.phone}`,
                    className: 'text-blue-400 hover:text-blue-300'
                  }, booking.phone)
                )
              ),
              e('span', { 
                className: `px-3 py-1 rounded-full text-xs font-semibold uppercase border ${getStatusColor(booking.status)}`
              }, booking.status)
            ),

            // Meeting details
            e('div', { className: 'grid md:grid-cols-2 gap-4 mb-4 bg-slate-900/50 rounded-lg p-4' },
              e('div', { className: 'flex items-center gap-3' },
                e('span', { className: 'text-2xl' }, '📅'),
                e('div', null,
                  e('div', { className: 'text-xs text-slate-500 uppercase' }, 'Date'),
                  e('div', { className: 'text-white font-medium' }, formatDate(booking.date))
                )
              ),
              e('div', { className: 'flex items-center gap-3' },
                e('span', { className: 'text-2xl' }, '🕐'),
                e('div', null,
                  e('div', { className: 'text-xs text-slate-500 uppercase' }, 'Time'),
                  e('div', { className: 'text-white font-medium' }, 
                    `${booking.time} (${booking.duration} min)`
                  )
                )
              ),
              e('div', { className: 'flex items-center gap-3' },
                e('span', { className: 'text-2xl' }, '📹'),
                e('div', null,
                  e('div', { className: 'text-xs text-slate-500 uppercase' }, 'Meeting Type'),
                  e('div', { className: 'text-white font-medium capitalize' }, 
                    booking.meeting_type.replace('min', ' min')
                  )
                )
              ),
              e('div', { className: 'flex items-center gap-3' },
                e('span', { className: 'text-2xl' }, '🔗'),
                e('div', null,
                  e('div', { className: 'text-xs text-slate-500 uppercase' }, 'Meeting Link'),
                  e('a', {
                    href: booking.meeting_link,
                    target: '_blank',
                    rel: 'noopener noreferrer',
                    className: 'text-blue-400 hover:text-blue-300 text-sm'
                  }, 'Join Meeting →')
                )
              )
            ),

            // Notes
            booking.notes && e('div', { className: 'mb-4 p-4 bg-slate-900/30 rounded-lg border border-slate-700' },
              e('div', { className: 'text-xs text-slate-500 uppercase mb-2' }, '📝 Notes'),
              e('p', { className: 'text-slate-300 text-sm' }, booking.notes)
            ),

            // Action buttons
            e('div', { className: 'flex flex-wrap gap-2 pt-4 border-t border-slate-700' },
              booking.status === 'confirmed' && [
                e('button', {
                  key: 'complete',
                  onClick: () => updateStatus(booking.id, 'completed'),
                  className: 'px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 border border-blue-500/30 transition-all text-sm font-medium'
                }, '✅ Mark Complete'),
                e('button', {
                  key: 'noshow',
                  onClick: () => updateStatus(booking.id, 'no-show'),
                  className: 'px-4 py-2 bg-yellow-500/20 text-yellow-400 rounded-lg hover:bg-yellow-500/30 border border-yellow-500/30 transition-all text-sm font-medium'
                }, '⏰ No Show'),
                e('button', {
                  key: 'cancel',
                  onClick: () => updateStatus(booking.id, 'cancelled'),
                  className: 'px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 border border-red-500/30 transition-all text-sm font-medium'
                }, '❌ Cancel')
              ],
              e('button', {
                onClick: () => window.open(`mailto:${booking.email}?subject=Regarding your booking on ${booking.date}`, '_blank'),
                className: 'px-4 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-all text-sm font-medium'
              }, '📧 Email Client'),
              e('button', {
                onClick: () => deleteBooking(booking.id),
                className: 'px-4 py-2 bg-slate-700 text-red-400 rounded-lg hover:bg-red-500/20 transition-all text-sm font-medium ml-auto'
              }, '🗑️ Delete')
            ),

            // Metadata
            e('div', { className: 'mt-4 pt-4 border-t border-slate-700 flex items-center justify-between text-xs text-slate-500' },
              e('span', null, `Booking ID: #${booking.id}`),
              e('span', null, `Created: ${new Date(booking.created_at).toLocaleDateString()}`)
            )
          )
        )
      )
    )
  );
}

// Add to the main AdminApp component's render switch statement:
// case 'bookings':
//   return e(BookingsManager);
