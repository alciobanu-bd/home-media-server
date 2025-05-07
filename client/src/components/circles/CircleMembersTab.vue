<template>
  <div class="circle-members-tab">
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Loading members...</p>
    </div>

    <div v-else>
      <!-- Admin Actions -->
      <div v-if="isAdmin" class="admin-actions">
        <button class="btn-primary" @click="$emit('invite')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="8.5" cy="7" r="4"></circle>
            <line x1="20" y1="8" x2="20" y2="14"></line>
            <line x1="23" y1="11" x2="17" y2="11"></line>
          </svg>
          <span>Invite Members</span>
        </button>
        
        <button class="btn-danger" @click="$emit('delete-circle')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
          <span>Delete Circle</span>
        </button>
      </div>
      
      <!-- Members Section -->
      <div class="members-section">
        <div class="section-header">
          <h2 class="section-title">Members</h2>
          <div class="member-count">{{ members.length }}</div>
        </div>
        
        <div v-if="members.length === 0" class="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
          <p>No members in this circle yet</p>
        </div>
        
        <div v-else class="member-grid">
          <div 
            v-for="member in members" 
            :key="member.id" 
            class="member-card"
            :class="{ 'is-current-user': isCurrentUser(member.id) }"
          >
            <div class="member-avatar">
              <img v-if="member.picture" :src="member.picture" :alt="member.name">
              <div v-else class="avatar-fallback">
                {{ getInitials(member.name) }}
              </div>
              <div v-if="member.isAdmin" class="admin-badge" title="Circle Admin">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L9.16 8.65L2 9.24L7.29 14.1L5.82 21L12 17.31L18.18 21L16.71 14.1L22 9.24L14.84 8.65L12 2Z"></path>            
                </svg>
              </div>
            </div>
            
            <div class="member-info">
              <div class="member-name">
                {{ member.name }}
                <span v-if="isCurrentUser(member.id)" class="current-user-tag">You</span>
              </div>
              <div class="member-email">{{ member.email }}</div>
            </div>
            
            <div class="member-actions">
              <template v-if="isAdmin && !isCurrentUser(member.id)">
                <button 
                  v-if="!member.isAdmin" 
                  class="action-button make-admin" 
                  @click="$emit('make-admin', member.id)"
                  title="Make Admin"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                  </svg>
                </button>
                <button 
                  class="action-button remove-member" 
                  @click="$emit('remove-member', member)"
                  title="Remove from Circle"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="15" y1="9" x2="9" y2="15"></line>
                    <line x1="9" y1="9" x2="15" y2="15"></line>
                  </svg>
                </button>
              </template>
              
              <button 
                v-if="isCurrentUser(member.id) && canLeaveCircle()" 
                class="action-button leave-circle" 
                @click="$emit('leave-circle')"
                title="Leave Circle"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Invitations Section -->
      <div v-if="isAdmin && invitations && invitations.length > 0" class="invitations-section">
        <div class="section-header">
          <h2 class="section-title">Pending Invites</h2>
          <div class="invite-count">{{ invitations.length }}</div>
        </div>
        
        <div class="invitation-grid">
          <div v-for="(invitation, index) in invitations" :key="index" class="invitation-card">
            <div class="invitation-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
            </div>
            
            <div class="invitation-info">
              <div class="invitation-email">{{ invitation.email }}</div>
              <div class="invitation-date">Invited {{ formatDate(invitation.invitedAt) }}</div>
            </div>
            
            <button 
              class="action-button cancel-invitation" 
              @click="$emit('cancel-invitation', invitation)" 
              title="Cancel Invitation"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="15" y1="9" x2="9" y2="15"></line>
                <line x1="9" y1="9" x2="15" y2="15"></line>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { format } from 'date-fns';

export default {
  name: 'CircleMembersTab',
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
    },
    loading: {
      type: Boolean,
      default: false
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
.circle-members-tab {
  width: 100%;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1.5rem;
  text-align: center;
  background-color: var(--color-bg-secondary);
  border-radius: 12px;
  min-height: 240px;
  margin-bottom: 1.5rem;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(156, 106, 222, 0.2);
  border-radius: 50%;
  border-top-color: var(--lumia-primary, #9c6ade);
  animation: spin 1s linear infinite;
  margin-bottom: 1.25rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-state p {
  font-size: 1.05rem;
  color: var(--color-text-secondary);
  font-weight: 500;
}

/* Admin actions */
.admin-actions {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding: 1.25rem;
  background: linear-gradient(135deg, rgba(156, 106, 222, 0.05), rgba(29, 209, 161, 0.05));
  border: 1px solid rgba(156, 106, 222, 0.15);
  border-radius: 12px;
}

.btn-primary, .btn-danger {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0.75rem 1.25rem;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.btn-primary {
  background: linear-gradient(45deg, var(--lumia-purple, #9c6ade), var(--lumia-green, #1dd1a1));
  color: white;
  box-shadow: 0 2px 8px rgba(156, 106, 222, 0.2);
}

.btn-primary:hover, .btn-primary:focus {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(156, 106, 222, 0.3);
}

.btn-danger {
  background-color: var(--color-error-light, #fee2e2);
  color: var(--color-error, #ef4444);
  border: 1px solid var(--color-error-border, #fecaca);
}

.btn-danger:hover, .btn-danger:focus {
  background-color: var(--color-error-lighter, #fef2f2);
  border-color: var(--color-error, #ef4444);
  transform: translateY(-2px);
}

.btn-primary svg, .btn-danger svg {
  width: 18px;
  height: 18px;
}

/* Section styling */
.members-section, .invitations-section {
  background-color: var(--color-bg-secondary);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-border-light);
  margin-bottom: 1.5rem;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--color-border-light);
}

.section-title {
  font-size: 1.15rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
  background: linear-gradient(90deg, var(--lumia-purple, #9c6ade), var(--lumia-green, #1dd1a1));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.member-count, .invite-count {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background-color: var(--color-bg-accent, rgba(156, 106, 222, 0.15));
  color: var(--lumia-primary, #9c6ade);
  font-size: 0.9rem;
  font-weight: 600;
  border-radius: 50%;
}

/* Empty state */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  color: var(--color-text-tertiary);
  text-align: center;
}

.empty-state svg {
  width: 64px;
  height: 64px;
  opacity: 0.6;
  margin-bottom: 1.5rem;
}

.empty-state p {
  font-size: 1.1rem;
  margin: 0;
}

/* Member Grid */
.member-grid, .invitation-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
  padding: 1.5rem;
}

.member-card, .invitation-card {
  display: flex;
  align-items: center;
  padding: 1rem;
  background-color: var(--color-bg-primary);
  border-radius: 12px;
  transition: all 0.2s ease;
  border: 1px solid var(--color-border-extra-light);
  gap: 1rem;
}

.member-card:hover, .invitation-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-sm);
  border-color: var(--color-border);
}

.member-card.is-current-user {
  background: linear-gradient(to right, var(--color-bg-primary), var(--color-bg-primary), rgba(156, 106, 222, 0.05));
  border-color: rgba(156, 106, 222, 0.2);
}

.member-avatar, .invitation-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
}

.invitation-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-bg-tertiary);
  color: var(--lumia-accent, #1dd1a1);
}

.invitation-icon svg {
  width: 24px;
  height: 24px;
}

.member-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-fallback {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--lumia-purple, #9c6ade), var(--lumia-green, #1dd1a1));
  color: white;
  font-weight: 600;
  font-size: 1.1rem;
}

.admin-badge {
  position: absolute;
  bottom: -3px;
  right: -3px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: white;
  color: var(--lumia-primary, #9c6ade);
  border: 2px solid var(--color-bg-primary);
  display: flex;
  align-items: center;
  justify-content: center;
}

.admin-badge svg {
  width: 14px;
  height: 14px;
}

.member-info, .invitation-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.member-name {
  font-weight: 600;
  color: var(--color-text-primary);
  font-size: 1rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: flex;
  align-items: center;
  gap: 8px;
}

.current-user-tag {
  font-size: 0.7rem;
  font-weight: 500;
  background-color: var(--color-bg-tertiary);
  color: var(--color-text-secondary);
  padding: 2px 6px;
  border-radius: 4px;
}

.member-email, .invitation-email {
  font-size: 0.85rem;
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.invitation-date {
  font-size: 0.8rem;
  color: var(--color-text-tertiary);
}

.member-actions {
  display: flex;
  gap: 0.35rem;
  margin-left: auto;
}

.action-button {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  color: var(--color-text-tertiary);
}

.action-button:hover {
  transform: scale(1.15);
  background-color: var(--color-bg-tertiary);
}

.action-button svg {
  width: 16px;
  height: 16px;
}

.make-admin:hover {
  color: var(--lumia-accent, #1dd1a1);
  background-color: rgba(29, 209, 161, 0.1);
}

.remove-member:hover, 
.leave-circle:hover, 
.cancel-invitation:hover {
  color: var(--color-error, #ef4444);
  background-color: rgba(239, 68, 68, 0.08);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .admin-actions {
    flex-direction: column;
  }
  
  .member-grid, .invitation-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  }
}

@media (max-width: 480px) {
  .member-grid, .invitation-grid {
    grid-template-columns: 1fr;
  }
  
  .btn-primary span, .btn-danger span {
    display: none;
  }
  
  .btn-primary, .btn-danger {
    width: 42px;
    height: 42px;
    padding: 0;
    border-radius: 50%;
  }
  
  .btn-primary svg, .btn-danger svg {
    margin: 0;
  }
  
  .admin-actions {
    flex-direction: row;
    justify-content: center;
    gap: 2rem;
  }
}
</style> 