let map;
let number = 0;
const points = [
    {lat: 40.19003, lng: 44.52147},//NPUA
    {lat: 40.18815, lng: 44.51901},//Paplavok
    {lat: 40.19109, lng: 44.51561},//Cascade
    {lat: 40.18755, lng: 44.51058},//Bryusov
    {lat: 40.18602, lng: 44.51515},//Opera
    {lat: 40.18437, lng: 44.51914},//Church
    {lat: 40.18413, lng: 44.52231},//Loft
    {lat: 40.18178, lng: 44.52559},//YSU
    {lat: 40.180814, lng: 44.516991},//Somewhere between hotels
    {lat: 40.17772, lng: 44.51263}// Republic Square
]

const tangents = [
    {lat: 0.8, lng: 0.1},
    {lat: 0.1, lng: 0.8},
    {lat: 0.1, lng: -0.8},
    {lat: 0.8, lng: 0.1},
    {lat: 0.8, lng: 0.1},
    {lat: 0.8, lng: 0.01},
    {lat: 0.1, lng: 0.8},
    {lat: -0.8, lng: 0.01},
    {lat: 1, lng: 0.001},
    {lat: 1, lng: 0}
]

const markers = [];
const polylines = [];

function drawPoints(map) {
    points.forEach(value => {
            let marker = new google.maps.Marker({
                position: value,
                map: map,
            })

            markers.push(marker)
        }
    );
    buttonsVisibilityChange("points", "spline");
}

function drawSpline(map) {
    // Discretize the spline (adjust the number of segments for smoothness)
    const segments = 100;

    // for (let i = 0; i < points.length - 1; i++) {
    for (let j = 0; j < segments; j++) {
        const {
            p0,
            p1,
            p2,
            p3
        } = calculateBezierPoints(points[number], points[number + 1], tangents[number], tangents[number + 1], j / segments);
        const segmentPoints = sampleBezierCurve(p0, p1, p2, p3, 100); // Sample 100 points for smoother curve
        const polyline = new google.maps.Polyline({
            path: segmentPoints,
            strokeColor: "#4CAF50", // Example color, adjust as needed
            strokeOpacity: 0.8,
            strokeWeight: 2,
            map: map,
        });

        polylines.push(polyline);
    }

    number++;
    document.getElementById("spline").innerText = `Draw part ${number + 1}`;
    (number);

    if (number === points.length - 1) {
        buttonsVisibilityChange("spline", "reset");
    }
}

function buttonsVisibilityChange(hideId, visibleId) {
    const hideButton = document.getElementById(hideId);
    hideButton.style.display = 'none';

    const visibleButton = document.getElementById(visibleId);
    visibleButton.style.display = 'block';
    if (visibleId === 'spline') {
        visibleButton.innerText = 'Draw part 1'
    }
}

function initMap() {
    // Define the map center and zoom level
    const mapCenter = {lat: 40.1852, lng: 44.5185};
    const zoomLevel = 15;

    // Create a map object
    map = new google.maps.Map(document.getElementById("map"), {
        center: mapCenter,
        zoom: zoomLevel,
    });
}

function reset() {
    while (markers.length !== 0) {
        let marker = markers.pop();
        marker.setMap(null);
    }

    while (polylines.length !== 0) {
        let polyline = polylines.pop();
        polyline.setMap(null);
    }
    number = 0;

    buttonsVisibilityChange("reset", "points");
}

// Function to calculate Bézier control points using de Casteljau's algorithm
function calculateBezierPoints(start, end, t0, t1, t) {
    const p0 = start;
    const p3 = end;

    // Use linear interpolation to find intermediate points
    const p1 = {
        lat: p0.lat + t0.lat * (p3.lat - p0.lat),
        lng: p0.lng + t0.lng * (p3.lng - p0.lng),
    };

    const p2 = {
        lat: p3.lat + t1.lat * (p0.lat - p3.lat),
        lng: p3.lng + t1.lng * (p0.lng - p3.lng),
    };

    // Use linear interpolation again to find points on the final segment
    const q0 = {
        lat: p0.lat + t.lat * (p1.lat - p0.lat),
        lng: p0.lng + t.lat * (p1.lng - p0.lng),
    };

    const q1 = {
        lat: p1.lat + t.lat * (p2.lat - p1.lat),
        lng: p1.lng + t.lat * (p2.lng - p1.lng),
    };

    const q2 = {
        lat: p2.lat + t.lat * (p3.lat - p2.lat),
        lng: p2.lng + t.lat * (p3.lng - p2.lng),
    };

    // Final interpolated point on the Bézier curve
    const p = {
        lat: q0.lat + t.lat * (q1.lat - q0.lat),
        lng: q0.lng + t.lat * (q1.lng - q0.lng),
    };

    return {p0, p1, p2, p3};
}

// Function to sample points from a Bézier curve using linear interpolation
function sampleBezierCurve(p0, p1, p2, p3, numSamples) {
    const curvePoints = [];

    for (let i = 0; i <= numSamples; i++) {
        const t = i / numSamples;
        const x = (1 - t) ** 3 * p0.lng + 3 * (1 - t) ** 2 * t * p1.lng + 3 * (1 - t) * t ** 2 * p2.lng + t ** 3 * p3.lng;
        const y = (1 - t) ** 3 * p0.lat + 3 * (1 - t) ** 2 * t * p1.lat + 3 * (1 - t) * t ** 2 * p2.lat + t ** 3 * p3.lat;

        curvePoints.push({lat: y, lng: x});
    }

    return curvePoints;
}
