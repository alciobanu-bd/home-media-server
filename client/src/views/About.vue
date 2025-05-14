<template>
  <div class="about-container">
    <div class="about-header">
      <h1>About Lumia <span class="beta-tag">BETA</span></h1>
      <p class="tagline">{{ currentTagline }}</p>
      <div class="beta-warning">
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
          <line x1="12" y1="9" x2="12" y2="13"></line>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
        <p><strong>Lumia is currently in beta development.</strong> Total media loss may occur at any time. Please keep backups of important media. <router-link to="/status" class="status-link">View Project Status</router-link></p>
      </div>
    </div>

    <div class="about-content">
      <section class="about-section">
        <h2>Our Mission: A Healthier Way to Connect and Share</h2>
        <p>Lumia was created with a simple but powerful mission: to provide a secure, private way to share your media with the people who matter most in your life.</p>
        <p>In a world saturated with public broadcasts and fleeting connections, we believe in the power of sharing authentically with the people who truly matter.</p>
        <p>Our mission is to provide a space where you can effortlessly connect and share your photos and videos with your closest circles – family, friends, and trusted communities. We're building a platform where privacy isn't an afterthought, but the foundation. Here, your moments are yours to share, exclusively, fostering deeper connections and more meaningful interactions. We empower you to curate your audience, ensuring your memories are seen and cherished by those who hold a special place in your life.</p>
      </section>
      
      <section class="about-section">
        <h2>Key Features</h2>
        <div class="features-grid">
          <div class="feature">
            <div class="feature-icon">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
              </svg>
            </div>
            <h3>Private Sharing</h3>
            <p>Share your media with complete control through Trusted Circles. Create private groups for family, friends, or colleagues and decide exactly who can see your photos and videos.</p>
          </div>
          
          <div class="feature">
            <div class="feature-icon">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <polyline points="21 15 16 10 5 21"></polyline>
              </svg>
            </div>
            <h3>Beautiful Galleries</h3>
            <p>Showcase your photos and videos in elegantly designed galleries with intuitive organization.</p>
          </div>
          
          <div class="feature">
            <div class="feature-icon">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <h3>Custom Albums</h3>
            <p>Create personalized albums to organize your media just the way you like it.</p>
          </div>

        </div>
      </section>
      
      <section class="about-section">
        <h2>Privacy First</h2>
        <p>At Lumia, we believe your personal media belongs to you. We don't analyze your content, sell your data, or expose you to targeted advertising. Your memories remain yours alone, to share only with those you choose.</p>
      </section>
      
      <section class="about-section">
        <h2>Resource-Efficient Design</h2>
        <p>Lumia is designed to operate with limited resources while providing the best possible experience. We implement smart compression and resource allocation to ensure reliability and performance, even on modest server infrastructure.</p>
        <div class="resource-notice">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
          </svg>
          <div>
            <h3>Limited Resources Project</h3>
            <p>Our subscription tiers are carefully designed to balance quality with resource constraints. Higher-tier subscriptions receive less compression and more storage allocation.</p>
            <router-link to="/status" class="status-link">View Project Status</router-link>
          </div>
        </div>
      </section>
      
      <section class="about-section">
        <h2>Get Started</h2>
        <p>Ready to take control of your media sharing experience? Explore Lumia's features and start sharing with your trusted circles today.</p>
        <div class="cta-buttons">
          <router-link to="/gallery" class="cta-button primary">Browse Your Media</router-link>
          <router-link to="/circles" class="cta-button secondary">Manage Trusted Circles</router-link>
          <router-link to="/status" class="cta-button special">Project Status</router-link>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
export default {
  name: 'About',
  data() {
    return {
      currentTagline: ""
    };
  },
  created() {
    // Get the current tagline from localStorage to maintain consistency
    try {
      const taglineData = localStorage.getItem('lumia_tagline');
      if (taglineData) {
        const data = JSON.parse(taglineData);
        this.currentTagline = data.tagline;
      } else {
        // Fallback to a default tagline if none is stored
        this.currentTagline = "Illuminate Your Media";
      }
    } catch (error) {
      console.error('Error retrieving tagline:', error);
      this.currentTagline = "Illuminate Your Media";
    }
  }
};
</script>

<style scoped>
.about-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 40px 20px;
  background-color: var(--color-background) !important;
  color: var(--color-text);
  min-height: calc(100vh - var(--header-height));
  box-sizing: border-box;
  position: relative;
  z-index: 1;
}

.about-header {
  text-align: center;
  margin-bottom: 50px;
}

.about-header h1 {
  font-size: 2.5rem;
  font-weight: 700;
  font-family: 'Poppins', sans-serif;
  margin-bottom: 16px;
  background: linear-gradient(90deg, #ff6b6b, #feca57, #48dbfb, #1dd1a1, #9c6ade, #ff9ff3);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  display: inline-flex;
  align-items: center;
  gap: 12px;
}

.beta-tag {
  font-size: 0.9rem;
  background: var(--color-error);
  color: white;
  -webkit-text-fill-color: white;
  padding: 3px 8px;
  border-radius: 4px;
  vertical-align: middle;
  font-weight: 700;
  letter-spacing: 1px;
  box-shadow: 0 2px 4px rgba(239, 68, 68, 0.3);
}

.beta-warning {
  margin: 20px auto;
  max-width: 800px;
  background-color: rgba(239, 68, 68, 0.08);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 8px;
  padding: 16px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.beta-warning svg {
  flex-shrink: 0;
  stroke: var(--color-error);
  width: 24px;
  height: 24px;
}

.beta-warning p {
  margin: 0;
  font-size: 1rem;
  line-height: 1.5;
}

.tagline {
  font-size: 1.2rem;
  color: var(--color-text-secondary);
  font-weight: 500;
}

.about-section {
  margin-bottom: 60px;
}

.about-section h2 {
  font-size: 1.8rem;
  font-weight: 600;
  margin-bottom: 20px;
  color: var(--color-text-primary);
  position: relative;
  padding-bottom: 12px;
}

.about-section h2::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 60px;
  height: 3px;
  background-color: var(--color-primary);
  border-radius: 3px;
}

.about-section p {
  font-size: 1.05rem;
  line-height: 1.7;
  color: var(--color-text-secondary);
  margin-bottom: 16px;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 30px;
  margin-top: 30px;
}

.feature {
  background-color: var(--color-card-background);
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border: 1px solid var(--color-border);
}

.feature:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  border-color: var(--color-primary);
}

.feature-icon {
  width: 50px;
  height: 50px;
  background-color: rgba(var(--color-primary-rgb), 0.1);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  color: var(--color-primary);
}

.feature h3 {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 12px;
  background: linear-gradient(90deg, #ff6b6b, #feca57, #48dbfb, #1dd1a1, #9c6ade);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-family: 'Poppins', sans-serif;
}

.feature p {
  font-size: 0.95rem;
  line-height: 1.6;
  color: var(--color-text-secondary);
  margin-bottom: 0;
}

.cta-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-top: 30px;
}

.resource-notice {
  background-color: var(--color-bg-secondary);
  border-radius: 12px;
  padding: 20px;
  margin: 20px 0;
  display: flex;
  align-items: flex-start;
  gap: 16px;
  border-left: 4px solid var(--color-primary);
}

.resource-notice svg {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  stroke: var(--color-primary);
}

.resource-notice h3 {
  margin: 0 0 10px 0;
  font-size: 1.2rem;
  color: var(--color-text-primary);
}

.resource-notice p {
  margin: 0 0 10px 0;
}

.status-link {
  display: inline-block;
  color: var(--color-primary);
  font-weight: 500;
  text-decoration: none;
  font-size: 0.95rem;
}

.status-link:hover {
  text-decoration: underline;
}

.cta-button {
  display: inline-block;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  text-decoration: none;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.cta-button.primary {
  background: var(--lumia-gradient);
  color: white;
  box-shadow: var(--lumia-shadow);
}

.cta-button.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(156, 106, 222, 0.35);
}

.cta-button.secondary {
  background-color: rgba(var(--color-primary-rgb), 0.1);
  color: var(--color-primary);
  border: 1px solid rgba(var(--color-primary-rgb), 0.2);
}

.cta-button.secondary:hover {
  background-color: rgba(var(--color-primary-rgb), 0.15);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(var(--color-primary-rgb), 0.1);
}

.cta-button.accent {
  background-color: var(--color-bg-tertiary);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
}

.cta-button.accent:hover {
  background-color: var(--color-hover);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border-color: var(--color-primary-light);
}

.cta-button.special {
  background-color: var(--color-bg-tertiary);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
}

.cta-button.special:hover {
  background-color: var(--color-hover);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border-color: var(--color-primary-light);
}

@media (max-width: 768px) {
  .about-container {
    padding: 30px 15px;
  }
  
  .about-header h1 {
    font-size: 2rem;
  }
  
  .tagline {
    font-size: 1rem;
  }
  
  .about-section h2 {
    font-size: 1.5rem;
  }
  
  .about-section p {
    font-size: 1rem;
  }
  
  .features-grid {
    grid-template-columns: 1fr;
  }
  
  .cta-buttons {
    flex-direction: column;
  }
  
  .cta-button {
    width: 100%;
    text-align: center;
  }
}

/* Improved dark mode specific overrides */
@media (prefers-color-scheme: dark) {
  .about-container {
    background-color: var(--color-background);
  }
  
  .feature {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    background-color: var(--color-card-background);
  }
  
  .feature:hover {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  }
  
  .feature-icon {
    background-color: rgba(var(--color-primary-rgb), 0.2);
  }
}

/* Support for theme attribute for systems that don't use prefers-color-scheme */
[data-theme="dark"] .about-container {
  background-color: var(--color-background) !important;
}

[data-theme="dark"] .feature {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  background-color: var(--color-card-background);
}

[data-theme="dark"] .cta-button.secondary {
  border-color: var(--color-border);
  color: var(--color-text-primary);
}

[data-theme="dark"] .feature:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

[data-theme="dark"] .feature-icon {
  background-color: rgba(var(--color-primary-rgb), 0.2);
}

[data-theme="dark"] .about-section h2::after {
  background-color: var(--color-primary);
}

/* Force background color for the entire page */
html[data-theme="dark"],
body[data-theme="dark"],
html[data-theme="dark"] body,
[data-theme="dark"] .about-container,
[data-theme="dark"] #app {
  background-color: var(--color-background) !important;
}

@media (prefers-color-scheme: dark) {
  html, body, #app, .about-container {
    background-color: var(--color-background) !important;
  }
}
</style> 