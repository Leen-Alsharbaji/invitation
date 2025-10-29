console.clear();

const canvas = document.getElementById("hero-lightpass");
const context = canvas.getContext("2d");

canvas.width = 1080;
canvas.height = 1080;

const frameCount = 64;
const currentFrame = index => (
  `media/output/Final_${(index + 1).toString().padStart(5, '0')}.webp`
);

const images = [];
const airpods = { frame: 20 };
let loadedFrames = 0;
const initialPreloadCount = 5;
let lastRenderedFrame = -1;
let lastImageLoadTime = 0;
const imageLoadThrottle = 80;

// Function to load a single image
function loadImage(i) {
  return new Promise(resolve => {
    const img = new Image();
    img.src = currentFrame(i);
    img.onload = () => {
      images[i] = img;
      loadedFrames++;
      resolve();
    };
    img.onerror = () => {
      console.warn(`Failed to load frame ${i}`);
      resolve(); // Still resolve to prevent hanging
    };
  });
}

// Load first few frames right away
async function preloadInitialFrames() {
  const promises = [];
  for (let i = 0; i < Math.min(initialPreloadCount, frameCount); i++) {
    promises.push(loadImage(i));
  }
  await Promise.all(promises);
  render(); // Draw first frame immediately
  lazyLoadRest(); // Start background loading
}

// Enhanced lazy loading
async function lazyLoadRest() {
  const batchSize = 2;
  const delay = 400;
  let i = initialPreloadCount;
  while (i < frameCount) {
    const batch = [];
    for (let j = 0; j < batchSize && i < frameCount; j++, i++) {
      batch.push(loadImage(i));
    }
    await Promise.all(batch);
    await new Promise(res => setTimeout(res, delay));
  }
  console.log("✅ All frames loaded!");
}

// Get the closest loaded frame (fallback)
function getLastLoadedFrame(target) {
  // First try to find loaded frames before target
  for (let i = target; i >= 0; i--) {
    if (images[i]) return i;
  }
  // Then try after target
  for (let i = target + 1; i < frameCount; i++) {
    if (images[i]) return i;
  }
  return 0;
}

// Get closest unloaded frame for lazy loading
function getClosestUnloadedFrame(target) {
  let minDist = Infinity, minIdx = -1;
  for (let i = 0; i < frameCount; i++) {
    if (!images[i]) {
      const dist = Math.abs(i - target);
      if (dist < minDist) {
        minDist = dist;
        minIdx = i;
      }
    }
  }
  return minIdx;
}

// Render function
function render() {
  const frameIndex = Math.round(airpods.frame);
  if (frameIndex === lastRenderedFrame) return;
  
  let img = images[frameIndex];
  if (!img) {
    const fallback = getLastLoadedFrame(frameIndex);
    img = images[fallback];
    console.log(`Frame ${frameIndex} not loaded, using ${fallback}`);
  }
  
  if (img) {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(img, 0, 0);
    lastRenderedFrame = frameIndex;
  }
}

// Initialize everything after DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
  await preloadInitialFrames();
  
  // Set up GSAP animation AFTER initial frames are loaded
  gsap.to(airpods, {
    frame: frameCount - 1,
    snap: "frame",
    ease: "none",
    scrollTrigger: {
      scrub: 0.5,
      onUpdate: self => {
        const now = Date.now();
        // Throttle image loading
        if (now - lastImageLoadTime > imageLoadThrottle) {
          const idx = getClosestUnloadedFrame(Math.round(airpods.frame));
          if (idx !== -1) {
            loadImage(idx);
            lastImageLoadTime = now;
          }
        }
        render();
      },
      onRefresh: () => {
        // Force render when ScrollTrigger refreshes
        render();
      }
    }
  });
  
  // Force an initial render to ensure something is displayed
  setTimeout(render, 100);
});