# Title

**mapbox problems**
cluster turning into individual, show only the last one

---

Store GeoJSON at URL
If possible, consider loading your GeoJSON from a data URL instead of holding it in a JavaScript object and passing to a Mapbox GL GeoJSON Source. This reduces client memory overhead. There are many different places where you can store your data. For GitHub files, you can use GitHub Pages to store and link to your data. Adding this data to your project with Mapbox GL JS should look something like the code below:

map.addSource('some id', {
  type: 'geojson',
  data: 'https://mydomain.mydata.geojson'
});
