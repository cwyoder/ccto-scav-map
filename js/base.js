// TO MAKE THE MAP APPEAR YOU MUST
// ADD YOUR ACCESS TOKEN FROM
// https://account.mapbox.com
mapboxgl.accessToken = 'pk.eyJ1IjoibWVwb2Rtb2xpayIsImEiOiJja3k5NmE4NmIwMWgzMm9tZ3RteTYyaXY3In0.VFTaG_ZP3juiVbJRDBmSjw';
const boundaries = [
  [-89.340000, 40.892000], // Southwest
  [-86.118000, 42.579000] // Northeast
];

const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/light-v10',
  center: [-87.847155, 41.839420],
  zoom: 8.5,
  maxBounds: boundaries
});

map.addControl(
  new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    mapboxgl: mapboxgl
  })
);

map.on('load', () => {
  // Add a new source from our GeoJSON data and
  // set the 'cluster' option to true. GL-JS will
  // add the point_count property to your source data.
  map.addSource('scavs', {
    type: 'geojson',
    data: 'scav-data.geojson',
    cluster: true,
    clusterMaxZoom: 14,
    clusterRadius: 50
  });

  map.addSource('cook', {
    type: 'geojson',
    data: 'cook-co.geojson'
  })

  map.addLayer({
    id: 'outline',
    type: 'line',
    source: 'cook',
    layout: {},
    paint: {
      'line-color': '#808080',
      'line-width': 3
    }
  })

  map.addLayer({
    id: 'clusters',
    type: 'circle',
    source: 'scavs',
    filter: ['has', 'point_count'],
    paint: {
      // Use step expressions (https://docs.mapbox.com/mapbox-gl-js/style-spec/#expressions-step)
      // with three steps to implement three types of circles:
      'circle-color': [
        'step',
        ['get', 'point_count'],
        '#ffee8d',
        100,
        '#ffdd1a',
        1000,
        '#ccb115'
      ],
      'circle-radius': [
        'step',
        ['get', 'point_count'],
        20,
        100,
        30,
        1000,
        40,
      ]
    }
  });

  map.addLayer({
    id: 'cluster-count',
    type: 'symbol',
    source: 'scavs',
    filter: ['has', 'point_count'],
    layout: {
      'text-field': '{point_count_abbreviated}',
      'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
      'text-size': 12
    }
  });

  map.addLayer({
    id: 'unclustered-point',
    type: 'circle',
    source: 'scavs',
    filter: ['!', ['has', 'point_count']],
    paint: {
      'circle-color': {
        property: 'class',
        type: 'categorical',
        stops: [
          ['Residential', '#51bbd6'],
          ['Commercial', '#F1A340'],
          ['Vacant Land', '#998EC3']
        ]
      },
      'circle-radius': 6,
      'circle-stroke-width': 1,
      'circle-stroke-color': '#fff'
    }
  });

  //zoom on cluster
  map.on('click', 'clusters', (e) => {
    const features = map.queryRenderedFeatures(e.point, {
      layers: ['clusters']
    });
    const clusterId = features[0].properties.cluster_id;
    map.getSource('scavs').getClusterExpansionZoom(
      clusterId,
      (err, zoom) => {
        if (err) return;
        map.easeTo({
          center: features[0].geometry.coordinates,
          zoom: zoom
        });
      }
    );
  });

  // When a click event occurs on a feature in
  // the unclustered-point layer, open a popup at
  // the location of the feature, with
  // description HTML from its properties.
  map.on('click', 'unclustered-point', (e) => {
    const coordinates = e.features[0].geometry.coordinates.slice();
    const dotProps = e.features[0].properties;
    const popupContent = `<p class='bold-text'>${dotProps.pin}</p><p class='bold-text'>${dotProps.address}, ${dotProps.city}</p><p>${dotProps.class}</p><p>2020 taxes billed: ${dotProps.taxes}</p>` + `<p><a target='_blank' href='${dotProps.map}'>CookViewer map</a></p>`

    // Ensure that if the map is zoomed out such that
    // multiple copies of the feature are visible, the
    // popup appears over the copy being pointed to.
    while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
      coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
    }
    console.log(popupContent);
    new mapboxgl.Popup()
      .setLngLat(coordinates)
      .setHTML(popupContent)
      .addTo(map);
  })

  // Mouse pointer on clusters
  map.on('mouseenter', 'clusters', () => {
    map.getCanvas().style.cursor = 'pointer';
  });

  map.on('mouseleave', 'clusters', () => {
    map.getCanvas().style.cursor = '';
  })

  // Mouse pointer on unclustered points
  map.on('mouseenter', 'unclustered-point', () => {
    map.getCanvas().style.cursor = 'pointer';
  });

  map.on('mouseleave', 'unclustered-point', () => {
    map.getCanvas().style.cursor = '';
  })




})
