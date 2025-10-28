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
const airpods = { frame: 0 };
let loadedFrames = 0;
const initialPreloadCount = 5; // how many frames to load immediately

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
  });
}

// Load first few frames right away (to prevent blank start)
async function preloadInitialFrames() {
  const promises = [];
  for (let i = 0; i < Math.min(initialPreloadCount, frameCount); i++) {
    promises.push(loadImage(i));
  }
  await Promise.all(promises);
  render(); // draw first frame
  lazyLoadRest(); // start background loading
}


// Enhanced lazy loading for very slow internet
async function lazyLoadRest() {
  const batchSize = 2; // load 2 frames at a time
  const delay = 400; // ms between batches
  let i = initialPreloadCount;
  while (i < frameCount) {
    const batch = [];
    for (let j = 0; j < batchSize && i < frameCount; j++, i++) {
      batch.push(loadImage(i));
    }
    await Promise.all(batch);
    // Optionally, update UI or show progress here
    await new Promise(res => setTimeout(res, delay));
  }
  console.log("✅ All frames loaded!");
}

// GSAP scroll animation setup

// Prioritize loading frames near current scroll position
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

gsap.to(airpods, {
  frame: frameCount - 1,
  snap: "frame",
  ease: "none",
  scrollTrigger: {
    scrub: 0.5,
    onUpdate: self => {
      // Try to load the closest frame to current scroll if not loaded
      const idx = getClosestUnloadedFrame(Math.round(airpods.frame));
      if (idx !== -1) loadImage(idx);
      render();
    }
  },
  onUpdate: render
});

function render() {
  const frameIndex = airpods.frame;
  const img = images[frameIndex];

  if (img) {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(img, 0, 0);
  }
}

preloadInitialFrames();
