
// load img 
const src = cv.imread(canvas);

// clean memory
src.delete();

// convert to grayscale
const gray = new cv.Mat()
cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);

// blur - remove tiny noise
// Rule:

// Too small → noisy edges

// Too large → panel borders vanish

// Start with 5x5.
const blurred = new cv.Mat();
cv.GaussianBlur(
    gray,
    blurred,
    new cv.Size(5, 5),
    0
)

// Dilate - connect broken lines and turn borders to solid shapes
// makes brokenn contours solid 
const kernel = cv.Mat.ones(3, 3, cv.CV_8U);
cv.dilate(edges, edges, kernel);
kernel.delete();

// Find contours 
const contours = new cv.MathVector();
const hierarchy = new cv.Mat();

cv.findContours(
    edges,
    contours,
    hierarchy,
    cv.RETR_EXTERNAL,
    cv.CHAIN_APPROX_SIMPLE
)

// Convert conours -> rectangles
const panels = [];

for (let i = 0; i < contours.size(); i++) {
  const contour = contours.get(i);
  const rect = cv.boundingRect(contour);

  panels.push({
    x: rect.x,
    y: rect.y,
    w: rect.width,
    h: rect.height
  });

  contour.delete();
}

// Filterring false positives

// 1. Min Size
const MIN_AREA = 5000;

const filtered = panels.filter(p =>
  p.w * p.h > MIN_AREA
);

// Aspect Ratio
const ratioFiltered = filtered.filter(p => {
  const ratio = p.w / p.h;
  return ratio > 0.2 && ratio < 5;
});

// Removing full Boxes
const finalPanels = ratioFiltered.filter(p =>
  p.w < src.cols * 0.95 &&
  p.h < src.rows * 0.95
);

// Sorting panels
finalPanels.sort((a, b) => {
  if (Math.abs(a.y - b.y) > 20) {
    return a.y - b.y;   // top to bottom
  }
  return b.x - a.x;     // right to left
});
