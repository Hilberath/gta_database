const center_x = 117.3;
const center_y = 172.8;
const scale_x = 0.02072;
const scale_y = 0.0205;

CUSTOM_CRS = L.extend({}, L.CRS.Simple, {
  projection: L.Projection.LonLat,
  scale: function (zoom) {
    return Math.pow(2, zoom);
  },
  zoom: function (sc) {
    return Math.log(sc) / 0.6931471805599453;
  },
  distance: function (pos1, pos2) {
    var x_difference = pos2.lng - pos1.lng;
    var y_difference = pos2.lat - pos1.lat;
    return Math.sqrt(x_difference * x_difference + y_difference * y_difference);
  },
  transformation: new L.Transformation(scale_x, center_x, -scale_y, center_y),
  infinite: true,
});

var SateliteStyle = L.tileLayer("mapStyles/styleSatelite/{z}/{x}/{y}.jpg", { minZoom: 0, maxZoom: 8, noWrap: true, continuousWorld: false, attribution: "Online map GTA V", id: "SateliteStyle map" }),
  AtlasStyle = L.tileLayer("mapStyles/styleAtlas/{z}/{x}/{y}.jpg", { minZoom: 0, maxZoom: 5, noWrap: true, continuousWorld: false, attribution: "Online map GTA V", id: "styleAtlas map" }),
  GridStyle = L.tileLayer("mapStyles/styleGrid/{z}/{x}/{y}.png", { minZoom: 0, maxZoom: 5, noWrap: true, continuousWorld: false, attribution: "Online map GTA V", id: "styleGrid map" });

var ExampleGroup = L.layerGroup();
var LocationsGroup = L.layerGroup();
var MLOsGroup = L.layerGroup();

var Icons = {
  Example: ExampleGroup,
  Locations: LocationsGroup,
  MLOs: MLOsGroup,
};

var mymap = L.map("map", {
  crs: CUSTOM_CRS,
  minZoom: 1,
  maxZoom: 5,
  Zoom: 5,
  maxNativeZoom: 5,
  preferCanvas: true,
  layers: [SateliteStyle],
  center: [0, 0],
  zoom: 3,
});

var layersControl = L.control.layers({ Satelite: SateliteStyle, Atlas: AtlasStyle, Grid: GridStyle }, Icons).addTo(mymap);

function customIcon(icon) {
  return L.icon({
    iconUrl: `blips/${icon}.png`,
    iconSize: [20, 20],
    iconAnchor: [20, 20],
    popupAnchor: [-10, -27],
  });
}

var X = 0;
var Y = 0;
L.marker([Y, X], { icon: customIcon(1) })
  .addTo(Icons["Example"])
  .bindPopup("I am here.");

//Locations
var X = -1035.0593;
var Y = -2733.6265;
L.marker([Y, X], { icon: customIcon(1) }).addTo(Icons["Locations"]).bindPopup(`
    <div style="text-align: center;">
      <img src="../../assets/img/gtav/locations/models/Los_Santos_International_Airport.webp" alt="Blip Image" style="width:250px;height:auto;margin-bottom:10px;">
      <p style="margin: 0;">Los Santos International Airport</p>
      <p style="margin: 0;">-1035.0593, -2733.6265, 20.1641</p>
    </div>
  `);

//MLOs
var X = -508.4572;
var Y = -257.0374;
L.marker([Y, X], { icon: customIcon(1) }).addTo(Icons["MLOs"]).bindPopup(`
    <div style="text-align: center;">
      <img src="../../assets/img/gtav/mlos/mlo_images/shmann/department_of_justice/Department_of_Justice_1.webp" alt="Blip Image" style="width:250px;height:auto;margin-bottom:10px;">
      <p style="margin: 0;">Department of Justice</p>
      <p style="margin: 0;">Shmann</p>
      <p style="margin: 0;">-508.4572, -257.0374, 35.5985</p>
    </div>
  `);
