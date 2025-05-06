<template>
  <div class="members-sidebar-component">
    <!-- Admin Actions -->
    <div v-if="isAdmin" class="sidebar-section admin-actions-section">
      <button class="btn btn-primary invite-btn" @click="$emit('invite')">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="8.5" cy="7" r="4"></circle>
          <line x1="20" y1="8" x2="20" y2="14"></line>
          <line x1="23" y1="11" x2="17" y2="11"></line>
        </svg>
        Invite Members
      </button>
      <button class="btn btn-danger delete-circle-btn" @click="$emit('delete-circle')">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="3 6 5 6 21 6"></polyline>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          <line x1="10" y1="11" x2="10" y2="17"></line>
          <line x1="14" y1="11" x2="14" y2="17"></line>
        </svg>
        Delete Circle
      </button>
    </div>
    
    <!-- Members Section -->
    <div class="sidebar-section members-list-section">
      <h2 class="section-title">Members ({{ members.length }})</h2>
      <div v-if="members.length === 0" class="empty-list-message">
        <p>No members in this circle yet.</p>
      </div>
      <div v-else class="list-items-container">
        <div v-for="member in members" :key="member.id" class="member-item">
          <div class="item-avatar-wrapper">
            <img v-if="member.picture" :src="member.picture" :alt="member.name" class="item-avatar-img">
            <div v-else class="item-avatar-default">
              {{ getInitials(member.name) }}
            </div>
          </div>
          
          <div class="item-details">
            <div class="item-name-line">
              <span class="item-name">{{ member.name }}</span>
              <span v-if="member.isAdmin" class="admin-status-badge" title="Circle Admin">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                    <path d="M12 2L9.16 8.65L2 9.24L7.29 14.1L5.82 21L12 17.31L18.18 21L16.71 14.1L22 9.24L14.84 8.65L12 2Z"></path>            
                </svg>
              </span>
            </div>
            <div class="item-subtext">{{ member.email }}</div>
          </div>
          
          <div class="item-actions" v-if="isAdmin && !isCurrentUser(member.id)">
            <button 
              v-if="!member.isAdmin" 
              class="btn-icon-action make-admin-action" 
              @click="$emit('make-admin', member.id)"
              title="Make Admin"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path> <path d="M12 2L9.16 8.65L2 9.24L7.29 14.1L5.82 21L12 17.31L18.18 21L16.71 14.1L22 9.24L14.84 8.65L12 2Z"></path>
              </svg>
            </button>
            <button 
              class="btn-icon-action remove-member-action" 
              @click="$emit('remove-member', member)"
              title="Remove from Circle"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 6L6 18M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          <div class="item-actions self-tag" v-else-if="isCurrentUser(member.id)">
            <span class="current-user-label">You</span>
            <button 
              v-if="canLeaveCircle()" 
              class="btn-icon-action leave-circle-action" 
              @click="$emit('leave-circle')"
              title="Leave Circle"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <div v-if="isAdmin && invitations && invitations.length > 0" class="sidebar-section invitations-list-section">
      <h2 class="section-title">Pending Invitations ({{ invitations.length }})</h2>
      <div class="list-items-container">
        <div v-for="(invitation, index) in invitations" :key="index" class="invitation-item-card">
          <div class="item-avatar-wrapper invitation-icon-wrapper">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
              <polyline points="22,6 12,13 2,6"></polyline>
            </svg>
          </div>
          <div class="item-details">
            <span class="item-name">{{ invitation.email }}</span>
            <small class="item-subtext date-text">Invited {{ formatDate(invitation.invitedAt) }}</small>
          </div>
          <button 
            class="btn-icon-action cancel-invitation-action" 
            @click="$emit('cancel-invitation', invitation)" 
            title="Cancel Invitation"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { format } from 'date-fns';

export default {
  name: 'CircleMembers',
  props: {
    members: {
      type: Array,
      default: () => []
    },
    invitations: {
      type: Array,
      default: () => []
    },
    isAdmin: {
      type: Boolean,
      default: false
    },
    currentUserId: {
      type: String,
      required: true
    }
  },
  
  emits: [
    'invite', 
    'delete-circle', 
    'make-admin', 
    'remove-member', 
    'leave-circle',
    'cancel-invitation'
  ],
  
  methods: {
    getInitials(name) {
      if (!name) return '?';
      return name.split(' ')
        .map(part => part.charAt(0).toUpperCase())
        .slice(0, 2)
        .join('');
    },
    
    formatDate(dateString) {
      try {
        const date = new Date(dateString);
        return format(date, 'MMM d, yyyy');
      } catch (error) {
        return 'Unknown date';
      }
    },
    
    isCurrentUser(userId) {
      return userId === this.currentUserId;
    },
    
    canLeaveCircle() {
      // User can leave if not the last admin
      const adminCount = this.members.filter(m => m.isAdmin).length;
      return !this.isAdmin || adminCount > 1;
    }
  }
};
</script>

<style scoped>
.members-sidebar-component {
  flex: 0 0 360px; /* Slightly adjusted width */
  max-height: calc(100vh - 48px); /* Adjust based on page padding / header */
  overflow-y: auto;
  padding-right: 1.5rem; /* Space between sidebar and main content if gap on parent is not enough */
  display: flex;
  flex-direction: column;
  gap: 1.5rem; /* Space between sections */
}

.sidebar-section {
  background-color: var(--color-bg-secondary); /* Lighter background for sections */
  border: 1px solid var(--color-border-light);
  border-radius: 12px;
  padding: 1.25rem;
}

.section-title {
  font-size: 1.2rem; /* Consistent section title size */
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 1rem 0;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--color-border-light);
}

.admin-actions-section {
  background: var(--color-gradient-light, linear-gradient(135deg, rgba(156, 106, 222, 0.05), rgba(29, 209, 161, 0.05)));
  border-color: var(--color-border-accent, rgba(156, 106, 222, 0.15));
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0.7rem 1.2rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
  border: none;
}

.btn-primary {
  background: var(--lumia-gradient, linear-gradient(45deg, #9c6ade, #1dd1a1));
  color: white;
  box-shadow: var(--lumia-shadow-sm, 0 2px 8px rgba(156, 106, 222, 0.2));
}
.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: var(--lumia-shadow-hover, 0 4px 12px rgba(156, 106, 222, 0.3));
}

.btn-danger {
  background-color: var(--color-error-light, #fee2e2);
  color: var(--color-error, #ef4444);
  border: 1px solid var(--color-error-border, #fecaca);
}
.btn-danger:hover {
  background-color: var(--color-error-lighter, #fce8e6);
  border-color: var(--color-error, #ef4444);
  color: var(--color-error-dark, #dc2626);
}

/* Member and Invitation Item Styling */
.list-items-container {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.member-item, .invitation-item-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background-color: var(--color-bg-primary);
  border: 1px solid var(--color-border-extra-light);
  border-radius: 8px;
  transition: background-color 0.2s ease, border-color 0.2s ease;
}

.member-item:hover, .invitation-item-card:hover {
  background-color: var(--color-hover-light);
  border-color: var(--color-border-medium);
}

.item-avatar-wrapper {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.invitation-icon-wrapper {
  background-color: var(--color-bg-tertiary);
  color: var(--lumia-accent, #1dd1a1);
}

.item-avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-avatar-default {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--lumia-gradient-soft, linear-gradient(45deg, rgba(156, 106, 222, 0.7), rgba(29, 209, 161, 0.7)));
  color: white;
  font-weight: 600;
  font-size: 0.85rem;
}

.item-details {
  flex: 1;
  min-width: 0; /* Prevent overflow */
}

.item-name-line {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin-bottom: 2px;
}

.item-name {
  font-weight: 500;
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.admin-status-badge {
  color: var(--lumia-primary, #9c6ade);
  display: flex; /* For SVG alignment */
  align-items: center;
}
.admin-status-badge svg {
  display:block; /* Remove extra space below svg */
}

.item-subtext {
  color: var(--color-text-secondary);
  font-size: 0.8rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.item-subtext.date-text {
  font-size: 0.75rem;
}

.item-actions {
  display: flex;
  align-items: center;
  gap: 0.3rem; /* Smaller gap for icon buttons */
  margin-left: auto; /* Push actions to the right */
}

.btn-icon-action {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease, transform 0.1s ease;
  color: var(--color-text-tertiary);
}

.btn-icon-action:hover {
  background-color: var(--color-hover);
  color: var(--color-text-primary);
  transform: scale(1.1);
}

.make-admin-action:hover {
  color: var(--lumia-accent, #1dd1a1);
  background-color: rgba(29, 209, 161, 0.1);
}

.remove-member-action:hover,
.leave-circle-action:hover,
.cancel-invitation-action:hover {
  color: var(--color-error, #ef4444);
  background-color: rgba(239, 68, 68, 0.08);
}

.current-user-label {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  background-color: var(--color-bg-tertiary);
  padding: 3px 8px;
  border-radius: 6px;
  font-weight: 500;
}

.empty-list-message p {
  color: var(--color-text-secondary);
  font-style: italic;
  font-size: 0.9rem;
  padding: 0.5rem 0;
}

/* Responsive */
@media (max-width: 992px) {
  .members-sidebar-component {
    flex-basis: auto; /* Full width on smaller screens */
    max-height: none;
    padding-right: 0;
  }
}
</style> 