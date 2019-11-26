{#if start.getTime() > now && (start.getTime() - now) < 7200 * 1000}
  <Alert color="orange" content={'Your next appointment is in ' + parseInt((start.getTime() - now) / (60 * 1000)) + ' minutes'} />
{:else if start.getTime() > now && (start.getTime() - now) < 86400 * 1000}
  <Alert content={'Your next appointment is in ' + Math.round((start.getTime() - now) / (3600 * 1000) * 10) / 10 + ' hours'} />
{/if}

<h2 class="mb-4 text-teal-800">{data.subject}</h2>
<div class="flex mb-4">
  <i class="fa fa-calendar-o fa-fw mt-1" aria-hidden="true"></i>
  <p class="ml-4">
    <span class="font-bold">Start:</span> {formatDate(start)}<br/>
    <span class="font-bold">End:</span> {formatDate(end)}
  </p>
</div>

{#if data.location}
  <div class="flex w-full md:w-3/4 lg:w-2/3 mb-4">
    <i class="fa fa-map-marker fa-fw mt-1" aria-hidden="true"></i>
    <div class="ml-4 w-full">
      <p class="font-bold">{data.location.displayName}</p>
      {#if data.location.address}
        <p>{data.location.address.street}, {data.location.address.city} {data.location.address.state}</p>
      {/if}
      {#if data.location.coordinates}
        <div id="mapcontainer" class="my-4" style="height: 400px; width: 100%;"></div>
      {/if}
    </div>
  </div>
{/if}

{#if data.body && data.bodyPreview && data.body.content && data.body.contentType}
  <EventBody data={data.body} />
{/if}

<!--<pre class="text-sm mt-8">{JSON.stringify(data, null, 2)}</pre>-->

<script>
import Alert from './Alert.svelte'
import EventBody from './EventBody.svelte'

// Properties for the view
export let data = {}

// Date formatter
function formatDate(date) {
    return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric'
    })
}

// Date
const now = Date.now()
let start
let end
$: {
    start = new Date(data.start.dateTime + 'Z')
    end = new Date(data.end.dateTime + 'Z')
}

// Map
$: {
    if (data && data.location && data.location.coordinates) {
        /* global Microsoft */
        setTimeout(() => {
            const map = new Microsoft.Maps.Map('#mapcontainer', {
                credentials: process.env.BING_MAPS_KEY,
                center: new Microsoft.Maps.Location(data.location.coordinates.latitude, data.location.coordinates.longitude),
                mapTypeId: Microsoft.Maps.MapTypeId.aerial,
                zoom: 16
            })

            const center = map.getCenter()

            //Create custom Pushpin
            const pin = new Microsoft.Maps.Pushpin(center, {
                title: data.location.displayName
            })

            //Add the pushpin to the map
            map.entities.push(pin)
        }, 0)
    }
}
</script>