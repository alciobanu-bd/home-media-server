<template>
  <div class="page-layout">
    <!-- Main content - removing the sidebar -->
    <div class="circle-view-container">
      <div v-if="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>Loading circle details...</p>
      </div>
      
      <div v-else-if="error" class="error-container">
        <div class="error-icon-container">
           <svg class="error-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        </div>
        <h3>Error Loading Circle</h3>
        <p>{{ error }}</p>
        <button class="secondary-btn" @click="$router.push('/circles')">
          Back to Circles
        </button>
      </div>
      
      <div v-else class="circle-details">
        <CircleHeader
          :name="circle.name"
          :description="circle.description"
          :isAdmin="circle.isAdmin"
          @edit="openEditCircleModal"
          @upload="uploadMedia"
          @share-album="shareAlbum"
        />
        
        <div class="circle-content">
          <div v-if="sharedAlbums.length === 0 && sharedFiles.length === 0 && timeline.length === 0 && circle.members.length <= 1" class="welcome-message">
            <h3>Welcome to {{ circle.name }}</h3>
            <p>This is a private circle where you can connect and share with trusted members.</p>
            <p>No content has been shared with this circle yet.</p>
          </div>
          
          <div v-else>
            <CircleTabs 
              v-model="activeTab" 
              :timelineCount="timeline.length"
              :albumsCount="sharedAlbums.length"
              :filesCount="sharedFiles.length"
              :membersCount="circle.members.length"
            />
            
            <div class="tab-content">
              <transition name="fade-slide" mode="out-in">
                <!-- Timeline Tab -->
                <CircleTimeline
                  v-if="activeTab === 'timeline'"
                  :timeline="timeline"
                  :loading="loadingTimeline"
                  :loadingMore="loadingMore" 
                  :nextPageTimestamp="nextPageTimestamp"
                  :circleId="circleId"
                  :apiBaseUrl="apiBaseUrl"
                  @load-more="loadMoreTimelineItems"
                  @view-album="viewAlbum"
                  @view-file="viewFile"
                  key="timeline"
                />
                
                <!-- Albums Tab -->
                <CircleAlbums
                  v-else-if="activeTab === 'albums'"
                  :albums="sharedAlbums"
                  :loading="loadingAlbums"
                  :circleId="circleId"
                  :ownerMap="ownerMap"
                  :apiBaseUrl="apiBaseUrl"
                  @view-album="viewAlbum"
                  key="albums"
                />
                
                <!-- Files Tab -->
                <CircleFiles
                  v-else-if="activeTab === 'files'"
                  :files="sharedFiles"
                  :loading="loadingFiles"
                  :circleId="circleId"
                  :ownerMap="ownerMap"
                  :apiBaseUrl="apiBaseUrl"
                  @view-file="viewFile"
                  key="files"
                />
                
                <!-- Members Tab -->
                <CircleMembersTab
                  v-else-if="activeTab === 'members'"
                  :members="circle.members"
                  :invitations="circle.invitations"
                  :isAdmin="circle.isAdmin"
                  :currentUserId="currentUserId"
                  :loading="loading"
                  @invite="showInviteModal = true"
                  @delete-circle="confirmDelete"
                  @make-admin="makeAdmin"
                  @remove-member="confirmRemoveMember"
                  @leave-circle="confirmLeave"
                  @cancel-invitation="cancelInvitation"
                  key="members"
                />
              </transition>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Modals -->
    <CircleInviteModal
      :show="showInviteModal"
      :circleId="circleId"
      :circleName="circle.name"
      @close="showInviteModal = false"
      @invited="loadCircleData"
    />
    
    <CircleEditModal
      :show="showEditCircleModal"
      :circleId="circleId" 
      :initialName="circle.name"
      :initialDescription="circle.description"
      @close="showEditCircleModal = false"
      @updated="handleCircleUpdated"
    />
    
    <CircleConfirmModal
      :show="showConfirmModal"
      :title="confirmTitle"
      :message="confirmMessage"
      :buttonText="confirmButtonText"
      :processing="processing"
      @close="cancelConfirmation"
      @confirm="processConfirmation"
    />
  </div>
</template>

<script>
import authStore from '../store/authStore';
import circlesService from '../services/circlesService';
import { format } from 'date-fns';

// Import components
import CircleHeader from '../components/circles/CircleHeader.vue';
import CircleTabs from '../components/circles/CircleTabs.vue';
import CircleTimeline from '../components/circles/CircleTimeline.vue';
import CircleAlbums from '../components/circles/CircleAlbums.vue';
import CircleFiles from '../components/circles/CircleFiles.vue';
import CircleMembersTab from '../components/circles/CircleMembersTab.vue';
import CircleInviteModal from '../components/circles/CircleInviteModal.vue';
import CircleEditModal from '../components/circles/CircleEditModal.vue';
import CircleConfirmModal from '../components/circles/CircleConfirmModal.vue';

export default {
  name: 'CircleView',
  components: {
    CircleHeader,
    CircleTabs,
    CircleTimeline,
    CircleAlbums,
    CircleFiles,
    CircleMembersTab,
    CircleInviteModal,
    CircleEditModal,
    CircleConfirmModal
  },
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
      sharedAlbums: [],
      loading: true,
      error: null,
      
      // Shared files related data
      sharedFiles: [],
      loadingFiles: false,
      
      // Timeline related data
      timeline: [],
      loadingTimeline: false,
      loadingMore: false,
      nextPageTimestamp: null,
      
      // Tab control
      activeTab: 'timeline',
      
      // Circle ID from route params
      circleId: this.$route.params.id,
      
      // API base URL for thumbnails
      apiBaseUrl: '/api',
      
      // Loading state for albums
      loadingAlbums: false,
      
      // Current user ID
      currentUserId: authStore.state.user ? authStore.state.user.id : null,
      
      // Owner mapping for user details
      ownerMap: {},
      
      // Modal visibility states
      showInviteModal: false,
      showEditCircleModal: false,
      showConfirmModal: false,
      
      // Confirmation modal data
      confirmTitle: '',
      confirmMessage: '',
      confirmButtonText: 'Confirm',
      confirmAction: null,
      confirmData: null,
      processing: false,
    };
  },
  computed: {
    formattedFileSize() {
      return (bytes) => {
        if (!bytes) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
      };
    },
  },
  async mounted() {
    // Load the circle data, timeline and shared albums
    try {
      this.loading = true;
      
      // Load all data in parallel to improve performance
      await Promise.all([
        this.loadCircleData(),
        this.loadTimeline(),
        this.loadSharedAlbums()  // Always load albums on initial load
      ]);
      
      this.loading = false;
    } catch (error) {
      console.error('Error loading circle data:', error);
      this.error = 'Failed to load circle data. Please try again.';
      this.loading = false;
    }
  },
  methods: {
    /**
     * Load all circle details
     */
    async loadCircleData() {
      try {
        // Get circle details using the existing method
        const response = await circlesService.getCircleById(this.circleId);
        this.circle = response;
      } catch (error) {
        console.error('Error loading circle details:', error);
        this.error = 'Failed to load circle details. The circle may not exist or you might not have permission to view it.';
      }
    },

    /**
     * Load shared albums for this circle
     */
    async loadSharedAlbums() {
      try {
        this.loadingAlbums = true;
        // Use the dedicated albums endpoint instead of the shared files endpoint
        const response = await circlesService.getCircleSharedAlbums(this.circleId);
        // Extract albums array from the response
        this.sharedAlbums = (response && response.albums) || [];
        this.loadingAlbums = false;
      } catch (error) {
        console.error('Error loading shared albums:', error);
        this.loadingAlbums = false;
      }
    },

    /**
     * Load shared files for the circle
     */
    async loadSharedFiles() {
      try {
        this.loadingFiles = true;
        const response = await circlesService.getCircleSharedFiles(this.circleId);
        this.sharedFiles = (response && response.files) || [];
        this.loadingFiles = false;
      } catch (error) {
        console.error('Error loading shared files:', error);
        this.loadingFiles = false;
      }
    },

    /**
     * Load timeline items for the circle
     */
    async loadTimeline() {
      try {
        this.loadingTimeline = true;
        
        // No timestamp for first page
        const options = {};
        
        const response = await circlesService.getCircleTimeline(this.circleId, options);
        
        if (response) {
          this.timeline = response.timeline || [];
          this.nextPageTimestamp = response.nextPageTimestamp;
        } else {
          this.timeline = [];
          this.nextPageTimestamp = null;
        }
        
        this.loadingTimeline = false;
      } catch (error) {
        console.error('Error loading timeline:', error);
        this.timeline = [];
        this.nextPageTimestamp = null;
        this.loadingTimeline = false;
      }
    },

    /**
     * Load more timeline items when pagination button is clicked
     */
    async loadMoreTimelineItems() {
      try {
        this.loadingMore = true;
        
        const options = {
          timestamp: this.nextPageTimestamp
        };
        
        const response = await circlesService.getCircleTimeline(this.circleId, options);
        const newTimelineItems = response.timeline || [];
        
        if (newTimelineItems.length > 0 && this.timeline.length > 0) {
          const lastExistingActivity = this.timeline[this.timeline.length - 1];
          const firstNewActivity = newTimelineItems[0];
          
          // Check if merge conditions are met (same user, same type)
          // We might add a time threshold later if needed, but user/type is a good start.
          if (
            lastExistingActivity && firstNewActivity &&
            lastExistingActivity.owner?.id === firstNewActivity.owner?.id &&
            lastExistingActivity.type === firstNewActivity.type
          ) {
            // Merge items from the first new activity into the last existing one
            lastExistingActivity.items.push(...firstNewActivity.items);
            // Optional: Update timestamp? For now, keep the original start time.
            // lastExistingActivity.createdAt = firstNewActivity.createdAt; 
            
            // Add the rest of the new items (excluding the merged one)
            this.timeline = [...this.timeline, ...newTimelineItems.slice(1)];
          } else {
            // No merge, just append all new items
            this.timeline = [...this.timeline, ...newTimelineItems];
          }
        } else {
          // If either current timeline or new items are empty, just append
          this.timeline = [...this.timeline, ...newTimelineItems];
        }
        
        this.nextPageTimestamp = response.nextPageTimestamp;
        this.loadingMore = false;
      } catch (error) {
        console.error('Error loading more timeline items:', error);
        this.loadingMore = false;
      }
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
      // Get the current user from auth store
      const currentUser = authStore.state.user;
      if (!currentUser) return false;
      
      // Compare the member ID with the current user's ID
      return userId === currentUser.id;
    },
    
    canLeaveCircle() {
      // Can leave if not the last admin
      const adminCount = this.circle.members.filter(m => m.isAdmin).length;
      return !this.circle.isAdmin || adminCount > 1;
    },
    
    async makeAdmin(userId) {
      try {
        await circlesService.makeAdmin(this.id, userId);
        await this.loadCircleData();
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
        await this.loadCircleData();
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
    },
    
    handleEscKey(event) {
      if (event.key === 'Escape') {
        if (this.showEditCircleModal) {
          this.showEditCircleModal = false;
        } else if (this.showInviteModal) {
          this.showInviteModal = false;
        } else if (this.showConfirmModal) {
          this.cancelConfirmation();
        }
      }
    },
    handleModalVisibilityChange(newValue) {
      if (newValue) {
        // Add event listener when modal is opened
        document.addEventListener('keydown', this.handleEscKey);
      } else {
        // Remove event listener when modal is closed
        document.removeEventListener('keydown', this.handleEscKey);
      }
    },
    formatTimeAgo(dateString) {
      try {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);
        
        if (diffInSeconds < 60) {
          return 'just now';
        }
        
        const diffInMinutes = Math.floor(diffInSeconds / 60);
        if (diffInMinutes < 60) {
          return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
        }
        
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) {
          return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
        }
        
        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 30) {
          return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
        }
        
        const diffInMonths = Math.floor(diffInDays / 30);
        if (diffInMonths < 12) {
          return `${diffInMonths} month${diffInMonths !== 1 ? 's' : ''} ago`;
        }
        
        const diffInYears = Math.floor(diffInMonths / 12);
        return `${diffInYears} year${diffInYears !== 1 ? 's' : ''} ago`;
      } catch (error) {
        return 'unknown time';
      }
    },
    getOwnerName(userId) {
      // Find the member with this userId
      const member = this.circle.members.find(member => member.id === userId);
      return member ? member.name : 'Unknown';
    },
    viewAlbum(albumId) {
      this.$router.push(`/albums/${albumId}`);
    },
    viewFile(fileId) {
      this.$router.push(`/view/${fileId}?circle=${this.circleId}&tab=files`);
    },
    handleCircleUpdated(updatedData) {
      // Update the circle with the new data from the edit modal
      this.circle.name = updatedData.name;
      this.circle.description = updatedData.description;
    },
    openEditCircleModal() {
      // Show modal
      this.showEditCircleModal = true;
    },
    uploadMedia() {
      // Placeholder for upload functionality
      alert('Upload functionality not yet implemented');
    },
    shareAlbum() {
      // Placeholder for sharing album functionality
      alert('Share album functionality not yet implemented');
    },
  },
  watch: {
    showEditCircleModal(newValue) {
      this.handleModalVisibilityChange(newValue);
    },
    showInviteModal(newValue) {
      this.handleModalVisibilityChange(newValue);
    },
    showConfirmModal(newValue) {
      this.handleModalVisibilityChange(newValue);
    },
    // Watch for changes in the active tab
    activeTab(newTab) {
      if (newTab === 'files' && this.sharedFiles.length === 0 && !this.loadingFiles) {
        this.loadSharedFiles();
      }
      
      // Load albums when switching to albums tab if they're not already loaded or loading
      if (newTab === 'albums' && this.sharedAlbums.length === 0 && !this.loadingAlbums) {
        this.loadSharedAlbums();
      }
      
      // Members tab is already loaded when the circle data is loaded
    },
    // Watch for changes in the route query to update the active tab
    '$route.query': {
      handler(newQuery) {
        const tabParam = newQuery.tab;
        if (tabParam && ['timeline', 'albums', 'files', 'members'].includes(tabParam)) {
          this.activeTab = tabParam;
          console.log('Updated active tab from route query:', tabParam);
        }
      },
      immediate: true
    }
  },
  beforeUnmount() {
    // Clean up event listener if component is unmounted while modal is open
    document.removeEventListener('keydown', this.handleEscKey);
  },
  created() {
    // Make sure we have the circle ID from the route
    if (!this.circleId && this.id) {
      this.circleId = this.id;
    } else if (!this.circleId && this.$route.params.id) {
      this.circleId = this.$route.params.id;
    }

    if (!this.circleId) {
      this.error = 'No circle ID provided';
      console.error('Circle ID not found in props or route params');
    }
    
    // Check for tab parameter in the URL query to set the active tab
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');
    if (tabParam && ['timeline', 'albums', 'files', 'members'].includes(tabParam)) {
      this.activeTab = tabParam;
      console.log('Setting active tab from query parameter:', tabParam);
    }
  },
};
</script>

<style scoped>
/* Page-level layout */
.page-layout {
  display: flex;
  max-width: var(--page-max-width, 1600px); /* Use a global variable if possible */
  margin: 0 auto;
  padding: 24px; /* Consistent page padding */
  background-color: var(--color-background);
  min-height: calc(100vh - var(--header-height)); /* Full height minus header */
  box-sizing: border-box;
}

/* Main content container styles */
.circle-view-container {
  flex: 1; /* Takes full space */
  min-width: 0; /* Prevents flex item overflow */
  display: flex;
  flex-direction: column;
  /* Ensure the container can grow as needed */
  height: auto;
  overflow: visible;
}

.loading-container, .error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px; /* Ensure it takes up some space */
  text-align: center;
  padding: 2rem;
  background-color: var(--color-bg-secondary);
  border-radius: 12px;
  border: 1px solid var(--color-border-light);
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid var(--color-border-light, rgba(156, 106, 222, 0.25));
  border-radius: 50%;
  border-top-color: var(--lumia-primary, #9c6ade);
  animation: spin 1s linear infinite;
  margin-bottom: 1.5rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-container p {
  font-size: 1.1rem;
  color: var(--color-text-secondary);
}

.error-icon-container {
  margin-bottom: 1.5rem;
}

.error-icon-svg {
  width: 64px;
  height: 64px;
  color: var(--color-error, #ef4444);
}

.error-container h3 {
  font-size: 1.75rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 0.75rem;
}

.error-container p {
  font-size: 1rem;
  color: var(--color-text-secondary);
  margin-bottom: 1.5rem;
}

/* Styling for the main content area once loaded */
.circle-details {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  /* Ensure content can expand as needed */
  height: auto;
  overflow: visible;
}

.circle-content {
  background-color: var(--color-bg-primary); /* Or var(--color-card-background) if you prefer cards for content sections */
  /* border: 1px solid var(--color-border); remove for a cleaner look, header has border */
  border-radius: 10px;
  padding: 0; /* Let tabs and content handle their own padding */
  /* box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05); Optional, can make it feel heavier */
  margin-top: 1.5rem; /* Space between header and content area */
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  width: 100%; /* Ensure full width */
  position: relative; /* Establish positioning context for children */
  min-height: 400px; /* Ensure a minimum height for content */
  /* Remove max-height constraints to allow content to extend */
}

.welcome-message {
  text-align: center;
  padding: 3rem 2rem;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: var(--color-bg-secondary);
  border-radius: 8px;
  margin: 1rem; /* Add some margin if inside a padded .circle-content */
}

.welcome-message h3 {
  font-size: 1.75rem;
  font-weight: 600;
  margin-bottom: 1rem;
  background: linear-gradient(90deg, var(--lumia-purple, #9c6ade), var(--lumia-green, #1dd1a1));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  font-family: 'Poppins', sans-serif;
}

.welcome-message p {
  color: var(--color-text-secondary);
  font-size: 1.1rem;
  line-height: 1.6;
  max-width: 500px;
  margin-bottom: 0.5rem;
}

.tab-content {
  padding: 1.5rem; /* Add padding around the tab content itself */
  flex-grow: 1;
  width: 100%;
  box-sizing: border-box; /* Include padding in width calculation */
  overflow-y: auto; /* Allow vertical scrolling within the tab content */
  overflow-x: hidden; /* Prevent horizontal scrolling */
}

/* Button styles (re-iterate for local scope if not globally available or for overrides) */
.secondary-btn {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
  background: transparent;
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
  text-decoration: none; /* For router-link like buttons */
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.secondary-btn:hover {
  background-color: var(--color-hover);
  border-color: var(--color-primary);
  color: var(--color-primary);
}

/* Responsive adjustments */
@media (max-width: 992px) {
  .page-layout {
    flex-direction: column;
    gap: 1.5rem;
    padding: 16px;
  }

  .circle-view-container {
    max-width: 100%; /* Full width on smaller screens */
  }
}

@media (max-width: 768px) {
  .tab-content {
    padding: 1rem;
  }
}

@media (max-width: 480px) {
  .tab-content {
    padding: 0.75rem;
  }
  
  .page-layout {
    padding: 12px;
  }
}

/* CSS additions */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style> 