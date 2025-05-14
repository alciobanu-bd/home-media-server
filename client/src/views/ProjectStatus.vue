xr<template>
  <div class="project-status">
    <div class="project-header">
      <h1>Lumia Project Status</h1>
      <p class="project-subtitle">Resource Constraints & Development Overview</p>
    </div>

    <div class="status-section beta-warning">
      <div class="beta-badge">BETA</div>
      <div class="warning-content">
        <h2>Important: Beta Software</h2>
        <p class="warning-text">Lumia is currently in <strong>beta stage development</strong>. During this phase:</p>
        <ul class="warning-list">
          <li><strong>Data loss may occur at any time</strong> - We recommend keeping backups of all important media</li>
          <li>Features may change or be removed without prior notice</li>
          <li>Performance and stability issues might be experienced</li>
          <li>Limited resources environment may lead to temporary service disruptions</li>
        </ul>
        <p class="warning-note">By using Lumia, you acknowledge these risks and understand that total media loss is possible while we continue to improve the platform.</p>
      </div>
    </div>

    <div class="status-section resource-section">
      <h2>
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
        </svg>
        Resource Limitations
      </h2>
      <div class="info-card">
        <div class="card-header warning">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
          <h3>Limited Resources Project</h3>
        </div>
        <p>Lumia is designed to operate with constrained resources. Our infrastructure runs on moderate hardware with specific capacity limits that influence how media is processed and stored.</p>
        
        <h4>Current Limitations:</h4>
        <ul>
          <li>
            <strong>Storage Capacity:</strong> 
            Total available storage is limited. Files are automatically compressed based on subscription tier to maximize available space.
          </li>
          <li>
            <strong>Processing Power:</strong> 
            Media processing (compression, thumbnail generation) uses shared CPU resources, which influences processing time and quality settings.
          </li>
          <li>
            <strong>Bandwidth:</strong> 
            Available network bandwidth affects upload/download speeds and the number of concurrent connections.
          </li>
        </ul>
      </div>
    </div>

    <div class="status-section resource-impact">
      <h2>
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        How This Affects Users
      </h2>
      <div class="impact-grid">
        <div class="impact-card">
          <div class="impact-icon compression">
            <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="1 4 1 10 7 10"></polyline>
              <polyline points="23 20 23 14 17 14"></polyline>
              <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path>
            </svg>
          </div>
          <h3>Media Compression</h3>
          <p>Files are compressed based on your subscription tier to balance quality with resource usage. Higher tiers receive less compression.</p>
          <div class="tier-compression">
            <div class="tier">
              <span class="tier-label">Lite</span>
              <div class="compression-bar">
                <div class="fill" style="width: 85%"></div>
              </div>
              <span class="compression-value">85% quality</span>
            </div>
            <div class="tier">
              <span class="tier-label">Glow</span>
              <div class="compression-bar">
                <div class="fill" style="width: 85%"></div>
              </div>
              <span class="compression-value">85% quality</span>
            </div>
            <div class="tier">
              <span class="tier-label">Aurora</span>
              <div class="compression-bar">
                <div class="fill" style="width: 100%"></div>
              </div>
              <span class="compression-value">100% quality</span>
            </div>
          </div>
        </div>

        <div class="impact-card">
          <div class="impact-icon storage">
            <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
              <line x1="12" y1="22.08" x2="12" y2="12"></line>
            </svg>
          </div>
          <h3>Storage Allocation</h3>
          <p>Each subscription tier has a set storage limit to ensure equitable resource distribution among users.</p>
          <div class="tier-storage">
            <div class="tier">
              <span class="tier-label">Lite</span>
              <span class="storage-value">2GB</span>
            </div>
            <div class="tier">
              <span class="tier-label">Glow</span>
              <span class="storage-value">20GB</span>
            </div>
            <div class="tier">
              <span class="tier-label">Aurora</span>
              <span class="storage-value">100GB</span>
            </div>
          </div>
        </div>

        <div class="impact-card">
          <div class="impact-icon resolution">
            <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="2" ry="2"></rect>
              <line x1="2" y1="8" x2="22" y2="8"></line>
              <line x1="2" y1="16" x2="22" y2="16"></line>
              <line x1="8" y1="2" x2="8" y2="22"></line>
              <line x1="16" y1="2" x2="16" y2="22"></line>
            </svg>
          </div>
          <h3>Resolution Limits</h3>
          <p>Maximum resolutions are set by tier to ensure efficient storage usage and optimal performance.</p>
          <div class="tier-resolution">
            <div class="tier">
              <span class="tier-label">Lite</span>
              <span class="resolution-value">1080p</span>
            </div>
            <div class="tier">
              <span class="tier-label">Glow</span>
              <span class="resolution-value">2160p (4K)</span>
            </div>
            <div class="tier">
              <span class="tier-label">Aurora</span>
              <span class="resolution-value">Original</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="status-section project-roadmap">
      <h2>
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="2" x2="12" y2="6"></line>
          <line x1="12" y1="18" x2="12" y2="22"></line>
          <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
          <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
          <line x1="2" y1="12" x2="6" y2="12"></line>
          <line x1="18" y1="12" x2="22" y2="12"></line>
          <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
          <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
        </svg>
        Project Roadmap
      </h2>
      <div class="roadmap-timeline">
        <div class="roadmap-item completed">
          <div class="status-dot"></div>
          <div class="roadmap-content">
            <h3>Phase 1: Core Functionality</h3>
            <span class="timestamp">Completed</span>
            <ul>
              <li>User authentication and security</li>
              <li>Media upload and storage</li>
              <li>Gallery and album organization</li>
              <li>Tiered subscription system</li>
            </ul>
          </div>
        </div>

        <div class="roadmap-item active">
          <div class="status-dot"></div>
          <div class="roadmap-content">
            <h3>Phase 2: Social Features</h3>
            <span class="timestamp">In Progress</span>
            <ul>
              <li>Circle creation and management</li>
              <li>Sharing media with circles</li>
              <li>Comments and reactions</li>
              <li>Resource utilization optimizations</li>
            </ul>
          </div>
        </div>

        <div class="roadmap-item">
          <div class="status-dot"></div>
          <div class="roadmap-content">
            <h3>Phase 3: Advanced Features</h3>
            <span class="timestamp">Planned</span>
            <ul>
              <li>AI-powered photo organization</li>
              <li>Improved video playback and transcoding</li>
              <li>Mobile application development</li>
              <li>Additional resource scaling options</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <div class="status-section system-status">
      <h2>
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3H6a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 3 3 0 0 0-3-3z"></path>
        </svg>
        System Status
      </h2>
      <div class="status-grid">
        <div class="status-card">
          <div class="status-indicator healthy"></div>
          <h3>Server</h3>
          <p>Operational</p>
        </div>
        <div class="status-card">
          <div class="status-indicator healthy"></div>
          <h3>File Storage</h3>
          <p>76% Capacity</p>
        </div>
        <div class="status-card">
          <div class="status-indicator healthy"></div>
          <h3>Database</h3>
          <p>Operational</p>
        </div>
        <div class="status-card">
          <div class="status-indicator warning"></div>
          <h3>Processing Queue</h3>
          <p>Higher than normal</p>
        </div>
        <div class="status-card beta-status-card">
          <div class="status-indicator beta"></div>
          <h3>Development Stage</h3>
          <p>BETA</p>
          <span class="beta-status-note">Data loss possible</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ProjectStatus',
  data() {
    return {
      // Any component data would go here
    };
  },
  created() {
    // Page title
    document.title = 'Lumia Project Status';
  }
};
</script>

<style scoped>
.project-status {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
  color: var(--color-text-primary);
}

.project-header {
  margin-bottom: 36px;
  text-align: center;
}

.project-header h1 {
  font-size: 2.5rem;
  margin-bottom: 12px;
  background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.project-subtitle {
  font-size: 1.2rem;
  color: var(--color-text-secondary);
  margin: 0;
}

.beta-warning {
  background-color: rgba(239, 68, 68, 0.08);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-left: 5px solid var(--color-error);
  position: relative;
  overflow: hidden;
}

.beta-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: var(--color-error);
  color: white;
  font-weight: 700;
  font-size: 0.85rem;
  padding: 4px 10px;
  border-radius: 4px;
  letter-spacing: 1px;
  box-shadow: 0 2px 6px rgba(239, 68, 68, 0.3);
}

.warning-content {
  padding-right: 70px;
}

.warning-content h2 {
  color: var(--color-error);
  border-bottom-color: rgba(239, 68, 68, 0.3);
}

.warning-text {
  font-size: 1.1rem;
  margin-bottom: 16px;
}

.warning-list {
  margin: 0 0 20px 0;
  padding-left: 24px;
}

.warning-list li {
  margin-bottom: 12px;
  line-height: 1.6;
  color: var(--color-text-primary);
}

.warning-note {
  font-style: italic;
  font-weight: 500;
  padding: 10px 16px;
  background-color: rgba(239, 68, 68, 0.08);
  border-radius: 6px;
  margin-bottom: 0;
}

.status-section {
  margin-bottom: 40px;
  background-color: var(--color-bg-secondary);
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.status-section h2 {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 1.5rem;
  margin-bottom: 24px;
  color: var(--color-text-primary);
  padding-bottom: 12px;
  border-bottom: 1px solid var(--color-border);
}

.status-section h2 svg {
  stroke: var(--color-primary);
}

.info-card {
  background-color: var(--color-bg-primary);
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.card-header.warning svg {
  stroke: var(--color-warning);
}

.card-header h3 {
  font-size: 1.25rem;
  margin: 0;
}

.info-card p {
  margin: 0 0 16px;
  line-height: 1.6;
}

.info-card h4 {
  font-size: 1rem;
  margin: 16px 0 8px;
}

.info-card ul {
  padding-left: 24px;
  margin: 0;
}

.info-card li {
  margin-bottom: 12px;
  line-height: 1.6;
}

.impact-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
}

.impact-card {
  background-color: var(--color-bg-primary);
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
}

.impact-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.impact-icon.compression {
  background-color: rgba(var(--color-primary-rgb), 0.1);
}

.impact-icon.compression svg {
  stroke: var(--color-primary);
}

.impact-icon.storage {
  background-color: rgba(var(--color-secondary-rgb), 0.1);
}

.impact-icon.storage svg {
  stroke: var(--color-secondary);
}

.impact-icon.resolution {
  background-color: rgba(255, 152, 0, 0.1);
}

.impact-icon.resolution svg {
  stroke: #ff9800;
}

.impact-card h3 {
  font-size: 1.25rem;
  margin: 0 0 12px;
}

.impact-card p {
  margin: 0 0 20px;
  line-height: 1.6;
  flex-grow: 1;
}

.tier-compression, .tier-storage, .tier-resolution {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.tier {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.tier-label {
  font-weight: 500;
  width: 60px;
}

.compression-bar {
  flex-grow: 1;
  height: 8px;
  background-color: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  overflow: hidden;
}

.compression-bar .fill {
  height: 100%;
  background: linear-gradient(90deg, #4caf50, #8bc34a);
  border-radius: 4px;
}

.compression-value, .storage-value, .resolution-value {
  font-size: 0.9rem;
  color: var(--color-text-secondary);
  text-align: right;
  width: 80px;
}

.roadmap-timeline {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.roadmap-item {
  display: flex;
  position: relative;
}

.roadmap-item::after {
  content: '';
  position: absolute;
  left: 16px;
  top: 30px;
  bottom: -24px;
  width: 2px;
  background-color: var(--color-border);
  z-index: 1;
}

.roadmap-item:last-child::after {
  display: none;
}

.status-dot {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: var(--color-bg-secondary);
  border: 2px solid var(--color-border);
  z-index: 2;
  margin-right: 16px;
  flex-shrink: 0;
}

.roadmap-item.completed .status-dot {
  background-color: var(--color-success);
  border-color: var(--color-success);
}

.roadmap-item.active .status-dot {
  background-color: var(--color-primary);
  border-color: var(--color-primary);
}

.roadmap-content {
  background-color: var(--color-bg-primary);
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
  flex-grow: 1;
}

.roadmap-content h3 {
  font-size: 1.2rem;
  margin: 0 0 8px;
}

.timestamp {
  display: inline-block;
  font-size: 0.9rem;
  color: var(--color-text-secondary);
  margin-bottom: 12px;
}

.roadmap-content ul {
  margin: 0;
  padding-left: 20px;
}

.roadmap-content li {
  margin-bottom: 8px;
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.status-card {
  background-color: var(--color-bg-primary);
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
}

.status-indicator {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  margin: 0 auto 12px;
}

.status-indicator.healthy {
  background-color: var(--color-success);
}

.status-indicator.warning {
  background-color: var(--color-warning);
}

.status-indicator.critical {
  background-color: var(--color-error);
}

.status-indicator.beta {
  background-color: var(--color-error);
  animation: pulse-error 2s infinite;
}

@keyframes pulse-error {
  0% { opacity: 1; }
  50% { opacity: 0.6; }
  100% { opacity: 1; }
}

.beta-status-card {
  border: 1px solid rgba(239, 68, 68, 0.3);
  background-color: rgba(239, 68, 68, 0.05);
}

.beta-status-note {
  display: block;
  font-size: 0.75rem;
  color: var(--color-error);
  margin-top: 4px;
  font-style: italic;
}

.status-card h3 {
  font-size: 1.1rem;
  margin: 0 0 8px;
}

.status-card p {
  margin: 0;
  color: var(--color-text-secondary);
}

/* Dark mode specific styles */
[data-theme="dark"] .info-card,
[data-theme="dark"] .impact-card,
[data-theme="dark"] .roadmap-content,
[data-theme="dark"] .status-card {
  background-color: var(--color-bg-tertiary);
}

[data-theme="dark"] .status-dot {
  background-color: var(--color-bg-tertiary);
  border-color: rgba(255, 255, 255, 0.2);
}

[data-theme="dark"] .compression-bar {
  background-color: rgba(255, 255, 255, 0.1);
}

[data-theme="dark"] .project-header h1 {
  background: linear-gradient(135deg, #a47dff, #43d9ad);
  -webkit-background-clip: text;
  background-clip: text;
}
</style> 