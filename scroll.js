console.clear();

const canvas = document.getElementById("hero-lightpass");
const context = canvas.getContext("2d");

canvas.width = 1080;
canvas.height = 1080;

const frameCount = 103;
const currentFrame = index => (
  `media/output/Final_${(index + 1).toString().padStart(5, '0')}.webp`
);

const images = [];
const airpods = { frame: 0 };
let loadedFrames = 0;
const initialPreloadCount = 10; // how many frames to load immediately

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

// Lazy-load the rest after initial frames are ready
async function lazyLoadRest() {
  for (let i = initialPreloadCount; i < frameCount; i++) {
    await loadImage(i);
  }
  console.log("✅ All frames loaded!");
}

// GSAP scroll animation setup
gsap.to(airpods, {
  frame: frameCount - 1,
  snap: "frame",
  ease: "none",
  scrollTrigger: {
    scrub: 0.5
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
