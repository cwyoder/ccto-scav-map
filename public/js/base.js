// TO MAKE THE MAP APPEAR YOU MUST
// ADD YOUR ACCESS TOKEN FROM
// https://account.mapbox.com
mapboxgl.accessToken = 'pk.eyJ1IjoibHVjaWRhLW1hcHMiLCJhIjoiY2t5MjM3NGZmMGd3bzJxbWZ0a3p3c2c1OSJ9.l0b6hje-1TFmM8JQFDuD4A';
const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/light-v10',
  center: [-87.847155, 41.879420],
  zoom: 8
});
