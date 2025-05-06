<template>
  <div class="members-sidebar">
    <!-- Admin Actions -->
    <div v-if="isAdmin" class="sidebar-section admin-actions">
      <div class="sidebar-actions">
        <button class="invite-btn" @click="$emit('invite')">
          <i class="fas fa-user-plus"></i> Invite Members
        </button>
        <button class="delete-btn" @click="$emit('delete-circle')">
          <i class="fas fa-trash-alt"></i> Delete Circle
        </button>
      </div>
    </div>
    
    <!-- Members Section -->
    <div class="sidebar-section members-section">
      <h2>Members ({{ members.length }})</h2>
      
      <div class="members-list">
        <div v-for="member in members" :key="member.id" class="member-card">
          <div class="member-avatar">
            <img v-if="member.picture" :src="member.picture" :alt="member.name">
            <div v-else class="default-avatar">
              {{ getInitials(member.name) }}
            </div>
          </div>
          
          <div class="member-details">
            <div class="member-name-wrapper">
              <span class="member-name">{{ member.name }}</span>
              <span v-if="member.isAdmin" class="admin-badge" title="Circle Admin">
                <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
                  <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
                </svg>
              </span>
            </div>
            <div class="member-email">{{ member.email }}</div>
          </div>
          
          <!-- Member actions -->
          <div class="member-actions" v-if="isAdmin && !isCurrentUser(member.id)">
            <button 
              v-if="!member.isAdmin" 
              class="action-btn make-admin-btn" 
              @click="$emit('make-admin', member.id)"
              title="Make Admin"
              aria-label="Make this member an admin of the circle"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16" aria-hidden="true">
                <path d="M12 1l3.22 6.52 7.2.62-5.2 5.07 1.22 7.13L12 16.77l-6.44 3.57 1.22-7.13-5.2-5.07 7.2-.62L12 1z"/>
              </svg>
            </button>
            
            <button 
              class="action-btn remove-btn" 
              @click="$emit('remove-member', member)"
              title="Remove from Circle"
              aria-label="Remove this member from the circle"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16" aria-hidden="true">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>
          
          <div class="member-actions self-actions" v-else-if="isCurrentUser(member.id)">
            <span class="self-label">You</span>
            
            <button 
              v-if="canLeaveCircle()" 
              class="action-btn leave-btn" 
              @click="$emit('leave-circle')"
              title="Leave Circle"
              aria-label="Leave this circle"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16" aria-hidden="true">
                <path fill-rule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Pending Invitations Section -->
    <div v-if="isAdmin && invitations && invitations.length > 0" class="sidebar-section pending-invitations">
      <h2>Pending Invitations</h2>
      
      <div class="invitations-list">
        <div v-for="(invitation, index) in invitations" :key="index" class="invitation-item">
          <div class="invitation-icon">
            <svg viewBox="0 0 20 20" fill="currentColor" width="20" height="20">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
            </svg>
          </div>
          <div class="invitation-details">
            <span class="invitation-email">{{ invitation.email }}</span>
            <small class="invitation-date">Invited {{ formatDate(invitation.invitedAt) }}</small>
          </div>
          
          <button 
            class="action-btn cancel-invite-btn" 
            @click="$emit('cancel-invitation', invitation)" 
            title="Cancel Invitation"
            aria-label="Cancel invitation for this email address"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16" aria-hidden="true">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
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
/* Sidebar styles */
.members-sidebar {
  flex: 0 0 380px;
  max-height: calc(100vh - 4rem);
  overflow-y: auto;
}

/* Sidebar sections */
.sidebar-section {
  background-color: var(--color-bg-primary);
  border: 1px solid var(--color-border);
  border-radius: 10px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.sidebar-section h2 {
  font-size: 1.3rem;
  margin: 0 0 1.2rem 0;
  padding-bottom: 0.8rem;
  border-bottom: 1px solid var(--color-border);
}

/* Members list */
.members-list {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.member-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.8rem;
  background-color: var(--color-bg-primary);
  border: 1px solid var(--color-border);
  border-radius: 10px;
  transition: box-shadow 0.2s ease;
}

.member-card:hover {
  box-shadow: 0 4px 12px rgba(156, 106, 222, 0.1);
}

.member-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
}

.member-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.default-avatar {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--lumia-gradient);
  color: white;
  font-weight: 600;
}

.member-details {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.member-name-wrapper {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 2px;
}

.member-name {
  font-weight: 600;
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.admin-badge {
  color: #f6b93b;
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.admin-badge svg {
  display: block;
}

.member-email {
  color: var(--color-text-secondary);
  font-size: 0.875rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.member-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-left: auto;
}

.action-btn {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  color: var(--color-text-secondary);
}

.action-btn:hover {
  background-color: var(--color-hover);
  color: var(--color-text-primary);
}

.make-admin-btn {
  color: #f6b93b;
}

.make-admin-btn:hover {
  color: #f6b93b;
  background-color: rgba(246, 185, 59, 0.1);
  transform: scale(1.1);
}

.remove-btn:hover, .leave-btn:hover {
  color: var(--color-error);
  background-color: rgba(239, 68, 68, 0.1);
}

.self-actions {
  justify-content: flex-end;
  gap: 0.5rem;
}

.self-label {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  background-color: var(--color-bg-tertiary);
  padding: 0.25rem 0.6rem;
  border-radius: 6px;
}

/* Invitations */
.invitations-list {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.invitation-item {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  background-color: var(--color-bg-tertiary);
  border-radius: 8px;
  transition: background-color 0.2s ease;
}

.invitation-item:hover {
  background-color: var(--color-hover);
}

.invitation-icon {
  flex-shrink: 0;
  margin-right: 0.75rem;
  color: var(--lumia-purple);
  display: flex;
  align-items: center;
}

.invitation-details {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.invitation-email {
  font-weight: 500;
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 2px;
}

.invitation-date {
  color: var(--color-text-secondary);
  font-size: 0.75rem;
}

.cancel-invite-btn {
  margin-left: auto;
}

.cancel-invite-btn:hover {
  color: var(--color-error);
  background-color: rgba(239, 68, 68, 0.1);
}

/* Admin actions in sidebar */
.admin-actions {
  padding: 1.25rem;
  margin-bottom: 1.5rem;
  background: linear-gradient(135deg, rgba(156, 106, 222, 0.08), rgba(29, 209, 161, 0.08));
  border: 1px solid rgba(156, 106, 222, 0.2);
}

.sidebar-actions {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.invite-btn, .delete-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
}

.invite-btn {
  background: linear-gradient(45deg, var(--primary-color), var(--accent-color));
  color: white;
  border: none;
  box-shadow: 0 4px 12px rgba(156, 106, 222, 0.2);
}

.invite-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(156, 106, 222, 0.3);
}

.delete-btn {
  background: transparent;
  color: #e74c3c;
  border: 1px solid #e74c3c;
}

.delete-btn:hover {
  background: rgba(231, 76, 60, 0.1);
  transform: translateY(-2px);
}

/* Responsive adjustments */
@media (max-width: 1200px) {
  .members-sidebar {
    flex-basis: 340px;
  }
}

@media (max-width: 992px) {
  .members-sidebar {
    flex-basis: auto;
    position: static;
    max-height: none;
    width: 100%;
  }
}
</style> 