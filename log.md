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

----
maybe it should be something like

sum, +, case, [[get, precision], exact, 1, 0
so its 0, when all points are of regions
so filter those out, they should be displayed by themselves


in general another approach would be to get all cluster in view
check them somehow, and eventually change the sources
all_entries maybe not but maybe this only needs to be base
Q: how to change layout & style of individual layer features?

Q: all cluster in view 
map.queryrenderedfeatures

so the programatic checks on all cluster
maybe not moving sources but setting the state:
e.g. *regions* only, or *one_region*
which would show region name, which also needs to be added to the cluster-state

how does it behave when there is only 1 in a cluster and its also a region.
similar stuff actually....

https://docs.mapbox.com/mapbox-gl-js/api/#map#getfilter

test: click on cluster, removes its leaves from the source


***USE https://docs.mapbox.com/mapbox-gl-js/api/#prewarm***