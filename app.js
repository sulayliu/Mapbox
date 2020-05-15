const formEle = document.querySelector(`form`);
const inputEle = document.querySelector(`form input`);
const ulEle = document.querySelector(`.points-of-interest`);
const mapDiv = document.querySelector('#map');
const links = document.querySelector(`.points-of-interest`);
let localLng = 0;
let localLat = 0;

formEle.addEventListener(`submit`, function(event){
  if(inputEle.value !== ``) {
    searchStreets(inputEle.value);
  }
  inputEle.value = ``;
  event.preventDefault();
});

links.addEventListener(`click`, function(event) {
  if (event.target.closest(`li`).className = `poi`) {
    const lng = event.target.closest(`aside > ul > li`).dataset.long;
    const lat = event.target.closest(`aside > ul > li`).dataset.lat;
    map.flyTo({center: [lng, lat], essential: true});
    marker.setLngLat([lng, lat]);
  }
})

navigator.geolocation.getCurrentPosition(success);

mapboxgl.accessToken = `pk.eyJ1Ijoic3VsYXlsaXUiLCJhIjoiY2thNWlrYmNnMDBpaDNsbm9lOHQ2MG5ncSJ9.iLbn-Tba_v8DH2S_ffwwDA`;

let map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v9',
  center: [-97, 49],
  zoom: 12
});

let marker = new mapboxgl.Marker()
  .setLngLat([-97, 49])
  .addTo(map);

function success(pos) {
  const crd = pos.coords;
  localLng = crd.longitude;
  localLat = crd.latitude;
  map.setCenter([localLng, localLat]);
  marker.setLngLat([localLng, localLat]);
}

function searchStreets(name) {
  fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${name}.json?proximity=${localLng},${localLat}&access_token=${mapboxgl.accessToken}&limit=10`)
    .then((resp) => {
      if (resp.ok) {
        return resp.json();
      } else {
        throw new Error("There is an error on street name.");
      }
    })
    .then((json) => {
      getStreetList(json.features);
    })

}

function getStreetList(features) {
  let streetHTML = ``;

  features.forEach(feature => {
    feature.distance = GetDistance(feature.center[0], feature.center[1], localLng, localLat);
  });

  features.sort((a, b) => a.distance - b.distance)

  
  features.forEach(feature => {
    const name = feature.place_name.split(`,`);
    streetHTML +=  `
      <li class="poi" data-long="${feature.center[0]}" data-lat="${feature.center[1]}">
        <ul>
          <li class="name">${name[0]}</li>
          <li class="street-address">${name[2]} ${name[1]}</li>
          <li class="distance">${feature.distance} KM</li>
        </ul>
      </li>`
  });

  ulEle.innerHTML = streetHTML;
}


function GetDistance(lng1, lat1,  lng2, lat2) {
  var radLat1 = lat1 * Math.PI / 180.0;
  var radLat2 = lat2 * Math.PI / 180.0;
  var a = radLat1 - radLat2;
  var  b = lng1 * Math.PI / 180.0 - lng2 * Math.PI / 180.0;
  var s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) +
  Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)));
  s = s * 6378.137 ;// EARTH_RADIUS;
  s = Math.round(s * 10000) / 10000;
  return s.toFixed(1);
}

//if (mapDiv.style.visibility === true) map.resize();


// map.on('load', function() {
//   map.loadImage(
//       'https://upload.wikimedia.org/wikipedia/commons/7/7c/201408_cat.png',
//       function(error, image) {
//           if (error) throw error;
//           map.addImage('cat', image);
//           map.addSource('point', {
//               'type': 'geojson',
//               'data': {
//                   'type': 'FeatureCollection',
//                   'features': [
//                       {
//                           'type': 'Feature',
//                           'geometry': {
//                               'type': 'Point',
//                               'coordinates': array
//                           }
//                       }
//                   ]
//               }
//           });
//           map.addLayer({
//               'id': 'points',
//               'type': 'symbol',
//               'source': 'point',
//               'layout': {
//                   'icon-image': 'cat',
//                   'icon-size': 0.25
//               }
//           });
//       }
//   );
// });