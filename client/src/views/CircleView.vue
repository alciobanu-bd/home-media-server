<template>
  <div class="circle-view-container">
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Loading circle details...</p>
    </div>
    
    <div v-else-if="error" class="error-container">
      <div class="error-icon">
        <i class="fas fa-exclamation-circle"></i>
      </div>
      <h3>Error Loading Circle</h3>
      <p>{{ error }}</p>
      <button class="secondary-btn" @click="$router.push('/circles')">
        Back to Circles
      </button>
    </div>
    
    <div v-else class="circle-details">
      <div class="circle-header">
        <div class="title-section">
          <h1>{{ circle.name }}</h1>
          <p v-if="circle.description" class="description">{{ circle.description }}</p>
        </div>
        
        <div class="actions">
          <button v-if="circle.isAdmin" class="invite-btn" @click="showInviteModal = true">
            <i class="fas fa-user-plus"></i> Invite Members
          </button>
          <button v-if="circle.isAdmin" class="delete-btn" @click="confirmDelete">
            <i class="fas fa-trash-alt"></i> Delete Circle
          </button>
        </div>
      </div>
      
      <div class="members-section">
        <h2>Members ({{ circle.members.length }})</h2>
        
        <div class="members-list">
          <div v-for="member in circle.members" :key="member.id" class="member-card">
            <div class="member-avatar">
              <img v-if="member.picture" :src="member.picture" :alt="member.name">
              <div v-else class="default-avatar">
                {{ getInitials(member.name) }}
              </div>
            </div>
            
            <div class="member-info">
              <div class="member-name">
                {{ member.name }}
                <span v-if="member.isAdmin" class="admin-badge">
                  <i class="fas fa-crown" title="Circle Admin"></i>
                </span>
              </div>
              <div class="member-email">{{ member.email }}</div>
            </div>
            
            <div v-if="circle.isAdmin && !isCurrentUser(member.id)" class="member-actions">
              <button 
                v-if="!member.isAdmin" 
                class="make-admin-btn" 
                @click="makeAdmin(member.id)"
                title="Make Admin"
              >
                <i class="fas fa-user-shield"></i>
              </button>
              
              <button 
                class="remove-btn" 
                @click="confirmRemoveMember(member)"
                title="Remove from Circle"
              >
                <i class="fas fa-user-minus"></i>
              </button>
            </div>
            
            <div v-else-if="isCurrentUser(member.id)" class="member-actions">
              <span class="self-label">You</span>
              
              <button 
                v-if="canLeaveCircle()" 
                class="leave-btn" 
                @click="confirmLeave()"
                title="Leave Circle"
              >
                <i class="fas fa-sign-out-alt"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div v-if="circle.isAdmin && circle.invitations && circle.invitations.length > 0" class="pending-invitations">
        <h2>Pending Invitations</h2>
        
        <div class="invitations-list">
          <div v-for="(invitation, index) in circle.invitations" :key="index" class="invitation-item">
            <div class="invitation-info">
              <i class="fas fa-envelope"></i>
              <span>{{ invitation.email }}</span>
              <small>Invited {{ formatDate(invitation.invitedAt) }}</small>
            </div>
            
            <button class="cancel-invite-btn" @click="cancelInvitation(invitation)" title="Cancel Invitation">
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Invite Modal -->
    <div v-if="showInviteModal" class="modal-overlay" @click.self="showInviteModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Invite to {{ circle.name }}</h2>
          <button class="close-btn" @click="showInviteModal = false">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="modal-body">
          <div class="form-group">
            <label for="invite-email">Email Address <span class="required">*</span></label>
            <input 
              id="invite-email" 
              v-model="inviteEmail" 
              type="email" 
              placeholder="Enter email address to invite"
              :class="{ 'error': inviteError }"
            >
            <p v-if="inviteError" class="error-text">{{ inviteError }}</p>
          </div>
        </div>
        
        <div class="modal-footer">
          <button class="secondary-btn" @click="showInviteModal = false">Cancel</button>
          <button 
            class="primary-btn" 
            @click="sendInvitation"
            :disabled="inviting || !inviteEmail"
          >
            <span v-if="inviting">Sending...</span>
            <span v-else>Send Invitation</span>
          </button>
        </div>
      </div>
    </div>
    
    <!-- Confirmation Modal -->
    <div v-if="showConfirmModal" class="modal-overlay" @click.self="cancelConfirmation">
      <div class="modal-content confirmation-modal">
        <div class="modal-header">
          <h2>{{ confirmTitle }}</h2>
          <button class="close-btn" @click="cancelConfirmation">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="modal-body">
          <p>{{ confirmMessage }}</p>
        </div>
        
        <div class="modal-footer">
          <button class="secondary-btn" @click="cancelConfirmation">Cancel</button>
          <button 
            class="danger-btn" 
            @click="processConfirmation"
            :disabled="processing"
          >
            <span v-if="processing">Processing...</span>
            <span v-else>{{ confirmButtonText }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import circlesService from '../services/circlesService';
import { format } from 'date-fns';

export default {
  name: 'CircleView',
  props: {
    id: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      circle: {
        name: '',
        description: '',
        members: [],
        isAdmin: false,
        invitations: []
      },
      loading: true,
      error: null,
      
      // Invite modal
      showInviteModal: false,
      inviteEmail: '',
      inviteError: '',
      inviting: false,
      
      // Confirmation modal
      showConfirmModal: false,
      confirmTitle: '',
      confirmMessage: '',
      confirmButtonText: 'Confirm',
      confirmAction: null,
      confirmData: null,
      processing: false
    };
  },
  async created() {
    try {
      await this.loadCircleDetails();
    } catch (error) {
      this.error = 'Failed to load circle details. The circle may not exist or you might not have permission to view it.';
      console.error('Error loading circle:', error);
    } finally {
      this.loading = false;
    }
  },
  methods: {
    async loadCircleDetails() {
      const response = await circlesService.getCircleById(this.id);
      this.circle = response;
    },
    
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
      // In a real app, we'd compare to the current user's ID from auth store
      // For now, we'll just check if the user is admin of this circle as a proxy
      return this.circle.members.find(m => m.id === userId && m.isAdmin);
    },
    
    canLeaveCircle() {
      // Can leave if not the last admin
      const adminCount = this.circle.members.filter(m => m.isAdmin).length;
      return !this.circle.isAdmin || adminCount > 1;
    },
    
    async sendInvitation() {
      if (!this.inviteEmail || !this.inviteEmail.includes('@')) {
        this.inviteError = 'Please enter a valid email address';
        return;
      }
      
      this.inviteError = '';
      this.inviting = true;
      
      try {
        await circlesService.inviteUser(this.id, this.inviteEmail);
        
        // Reset form
        this.inviteEmail = '';
        this.showInviteModal = false;
        
        // Reload circle details to show updated invitations
        await this.loadCircleDetails();
        
        // Notify user
        alert('Invitation sent successfully!');
      } catch (error) {
        console.error('Error sending invitation:', error);
        
        // Extract error message from response if available
        if (error.response && error.response.data && error.response.data.message) {
          this.inviteError = error.response.data.message;
        } else {
          this.inviteError = 'Failed to send invitation. Please try again.';
        }
      } finally {
        this.inviting = false;
      }
    },
    
    async makeAdmin(userId) {
      try {
        await circlesService.makeAdmin(this.id, userId);
        await this.loadCircleDetails();
        alert('User is now an admin of this Circle.');
      } catch (error) {
        console.error('Error making user admin:', error);
        alert('Failed to update admin status. Please try again.');
      }
    },
    
    confirmRemoveMember(member) {
      this.confirmTitle = 'Remove Member';
      this.confirmMessage = `Are you sure you want to remove ${member.name} from this Circle?`;
      this.confirmButtonText = 'Remove';
      this.confirmAction = this.removeMember;
      this.confirmData = member.id;
      this.showConfirmModal = true;
    },
    
    async removeMember(userId) {
      try {
        this.processing = true;
        await circlesService.removeUser(this.id, userId);
        await this.loadCircleDetails();
      } catch (error) {
        console.error('Error removing member:', error);
        alert('Failed to remove member. Please try again.');
      } finally {
        this.processing = false;
        this.showConfirmModal = false;
      }
    },
    
    confirmLeave() {
      this.confirmTitle = 'Leave Circle';
      this.confirmMessage = 'Are you sure you want to leave this Circle? You will need to be invited again to rejoin.';
      this.confirmButtonText = 'Leave';
      this.confirmAction = this.leaveCircle;
      this.showConfirmModal = true;
    },
    
    async leaveCircle() {
      try {
        this.processing = true;
        // Leave circle is the same as removing yourself
        await circlesService.removeUser(this.id, 'me'); // Server side will use the authenticated user
        // Redirect back to circles listing
        this.$router.push('/circles');
      } catch (error) {
        console.error('Error leaving circle:', error);
        alert('Failed to leave circle. Please try again.');
        this.processing = false;
        this.showConfirmModal = false;
      }
    },
    
    confirmDelete() {
      this.confirmTitle = 'Delete Circle';
      this.confirmMessage = 'Are you sure you want to delete this Circle? This action cannot be undone.';
      this.confirmButtonText = 'Delete';
      this.confirmAction = this.deleteCircle;
      this.showConfirmModal = true;
    },
    
    async deleteCircle() {
      try {
        this.processing = true;
        await circlesService.deleteCircle(this.id);
        // Redirect back to circles listing
        this.$router.push('/circles');
      } catch (error) {
        console.error('Error deleting circle:', error);
        alert('Failed to delete circle. Please try again.');
        this.processing = false;
        this.showConfirmModal = false;
      }
    },
    
    cancelInvitation(invitation) {
      // This would require a new API endpoint to cancel invitations
      console.log('Would cancel invitation for:', invitation.email);
      alert('This feature is not yet implemented.');
    },
    
    processConfirmation() {
      if (this.confirmAction) {
        this.confirmAction(this.confirmData);
      }
    },
    
    cancelConfirmation() {
      this.showConfirmModal = false;
      this.confirmAction = null;
      this.confirmData = null;
    }
  }
};
</script>

<style scoped>
.circle-view-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.loading-container, .error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  text-align: center;
}

.loading-spinner {
  border: 3px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top: 3px solid var(--primary-color);
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-icon {
  font-size: 4rem;
  color: #e74c3c;
  margin-bottom: 1rem;
}

.error-container h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
}

.error-container p {
  margin: 0 0 1.5rem 0;
  color: var(--text-color-muted);
}

.circle-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--border-color);
}

.title-section h1 {
  margin: 0 0 0.5rem 0;
  font-size: 2rem;
}

.description {
  margin: 0;
  color: var(--text-color-muted);
}

.actions {
  display: flex;
  gap: 1rem;
}

.invite-btn, .delete-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.2s;
}

.invite-btn {
  background: linear-gradient(45deg, var(--primary-color), var(--accent-color));
  color: white;
  border: none;
}

.invite-btn:hover {
  opacity: 0.9;
}

.delete-btn {
  background: transparent;
  color: #e74c3c;
  border: 1px solid #e74c3c;
}

.delete-btn:hover {
  background: rgba(231, 76, 60, 0.1);
}

.members-section, .pending-invitations {
  margin-bottom: 2.5rem;
}

.members-section h2, .pending-invitations h2 {
  font-size: 1.5rem;
  margin: 0 0 1.5rem 0;
}

.members-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1rem;
}

.member-card {
  display: flex;
  align-items: center;
  padding: 1rem;
  background-color: var(--bg-color);
  border: 1px solid var(--border-color);
  border-radius: 8px;
}

.member-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 1rem;
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
  background: linear-gradient(45deg, var(--primary-color), var(--accent-color));
  color: white;
  font-weight: bold;
}

.member-info {
  flex: 1;
  min-width: 0;
}

.member-name {
  font-weight: bold;
  margin-bottom: 0.25rem;
  display: flex;
  align-items: center;
}

.admin-badge {
  margin-left: 0.5rem;
  color: #f6b93b;
  font-size: 0.875rem;
}

.member-email {
  color: var(--text-color-muted);
  font-size: 0.875rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.member-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.make-admin-btn, .remove-btn, .leave-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 1px solid var(--border-color);
  cursor: pointer;
  transition: all 0.2s;
}

.make-admin-btn {
  color: #f6b93b;
}

.make-admin-btn:hover {
  background: rgba(246, 185, 59, 0.1);
  border-color: #f6b93b;
}

.remove-btn, .leave-btn {
  color: #e74c3c;
}

.remove-btn:hover, .leave-btn:hover {
  background: rgba(231, 76, 60, 0.1);
  border-color: #e74c3c;
}

.self-label {
  font-size: 0.875rem;
  color: var(--text-color-muted);
  background: var(--bg-color-light);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  margin-right: 0.5rem;
}

.invitations-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.invitation-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  background-color: var(--bg-color-light);
  border-radius: 4px;
}

.invitation-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.invitation-info i {
  color: var(--primary-color);
}

.invitation-info small {
  color: var(--text-color-muted);
  font-size: 0.75rem;
}

.cancel-invite-btn {
  background: transparent;
  border: none;
  color: #e74c3c;
  cursor: pointer;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background 0.2s;
}

.cancel-invite-btn:hover {
  background: rgba(231, 76, 60, 0.1);
}

/* Modal styling */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background-color: var(--bg-color);
  border-radius: 8px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.2);
}

.confirmation-modal {
  max-width: 400px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--border-color);
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
}

.close-btn {
  background: transparent;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  color: var(--text-color-muted);
}

.modal-body {
  padding: 1.5rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--border-color);
  gap: 1rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
}

.required {
  color: #e74c3c;
}

input, textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background-color: var(--input-bg);
  color: var(--text-color);
}

input:focus, textarea:focus {
  outline: none;
  border-color: var(--primary-color);
}

input.error, textarea.error {
  border-color: #e74c3c;
}

.error-text {
  color: #e74c3c;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.primary-btn {
  background: linear-gradient(45deg, var(--primary-color), var(--accent-color));
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.75rem 1.5rem;
  font-weight: bold;
  cursor: pointer;
  transition: opacity 0.2s;
}

.primary-btn:hover {
  opacity: 0.9;
}

.primary-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.secondary-btn {
  background: transparent;
  color: var(--text-color);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  padding: 0.75rem 1.5rem;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.2s;
}

.secondary-btn:hover {
  background: var(--bg-color-light);
}

.danger-btn {
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.75rem 1.5rem;
  font-weight: bold;
  cursor: pointer;
  transition: opacity 0.2s;
}

.danger-btn:hover {
  opacity: 0.9;
}

.danger-btn:disabled {
  background: #e57373;
  cursor: not-allowed;
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .circle-view-container {
    --bg-color: #1a1a1a;
    --bg-color-light: #2a2a2a;
    --text-color: #f5f5f5;
    --text-color-muted: #aaa;
    --border-color: #444;
    --input-bg: #333;
  }
  
  .loading-spinner {
    border: 3px solid rgba(255, 255, 255, 0.1);
    border-top: 3px solid var(--primary-color);
  }
}

/* Light mode */
@media (prefers-color-scheme: light) {
  .circle-view-container {
    --bg-color: #ffffff;
    --bg-color-light: #f5f5f5;
    --text-color: #333;
    --text-color-muted: #777;
    --border-color: #ddd;
    --input-bg: #fff;
  }
}
</style> 