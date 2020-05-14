// const options = {
//   enableHighAccuracy: true,
//   timeout: 5000,
//   maximumAge: 0
// };

const formEle = document.querySelector(`form`);
const inputEle = document.querySelector(`form input`);
const key = `pk.eyJ1Ijoic3VsYXlsaXUiLCJhIjoiY2thNWlrYmNnMDBpaDNsbm9lOHQ2MG5ncSJ9.iLbn-Tba_v8DH2S_ffwwDA`;
const ulEle = document.querySelector(`.points-of-interest`);
const location = [];

formEle.addEventListener(`submit`, function(event){
  if(inputEle.value !== ``) {
    searchStreets(inputEle.value);
  }
  inputEle.value = ``;
  event.preventDefault();
});

function success(pos) {
  const crd = pos.coords;

  console.log('Your current position is:');
  console.log(`Latitude : ${crd.latitude.toFixed(2)}`);
  console.log(`Longitude: ${crd.longitude.toFixed(2)}`);
  console.log(`More or less ${crd.accuracy} meters.`);

  location.push(crd.longitude.toFixed(3))
  location.push(crd.latitude.toFixed(3));
  getMap(location)

}

function error(err) {
  console.warn(`ERROR(${err.code}): ${err.message}`);
}

navigator.geolocation.getCurrentPosition(success, error);

mapboxgl.accessToken = key;


function getMap(array) {

  let map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v9',
    center: array,
    zoom: 12
  });

  let marker = new mapboxgl.Marker()
    .setLngLat(array)
    .addTo(map);

  map.on('load', function() {
      map.loadImage(
          'https://upload.wikimedia.org/wikipedia/commons/7/7c/201408_cat.png',
          function(error, image) {
              if (error) throw error;
              map.addImage('cat', image);
              map.addSource('point', {
                  'type': 'geojson',
                  'data': {
                      'type': 'FeatureCollection',
                      'features': [
                          {
                              'type': 'Feature',
                              'geometry': {
                                  'type': 'Point',
                                  'coordinates': array
                              }
                          }
                      ]
                  }
              });
              map.addLayer({
                  'id': 'points',
                  'type': 'symbol',
                  'source': 'point',
                  'layout': {
                      'icon-image': 'cat',
                      'icon-size': 0.25
                  }
              });
          }
      );
  });
}


function searchStreets(name) {
  fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${name}.json?access_token=${key}`)
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
    const name = feature.place_name.split(`,`);
    streetHTML +=  `
      <li class="poi" data-long="${feature.center[0]}" data-lat="${feature.center[1]}">
        <ul>
          <li class="name">${name[0]}</li>
          <li class="street-address">${name[2]} ${name[1]}</li>
          <li class="distance">5.8 KM</li>
        </ul>
      </li>`
  });

  ulEle.innerHTML = streetHTML;
}

// 方法定义 lat,lng 
function GetDistance( lat1,  lng1,  lat2,  lng2){
  var radLat1 = lat1*Math.PI / 180.0;
  var radLat2 = lat2*Math.PI / 180.0;
  var a = radLat1 - radLat2;
  var  b = lng1*Math.PI / 180.0 - lng2*Math.PI / 180.0;
  var s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a/2),2) +
  Math.cos(radLat1)*Math.cos(radLat2)*Math.pow(Math.sin(b/2),2)));
  s = s *6378.137 ;// EARTH_RADIUS;
  s = Math.round(s * 10000) / 10000;
  return s;
}
// 调用 return的距离单位为km
GetDistance(10.0,113.0,12.0,114.0)