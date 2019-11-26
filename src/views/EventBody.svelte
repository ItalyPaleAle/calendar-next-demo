<div class="flex w-full md:w-3/4 lg:w-2/3 mb-4">
  <i class="fa fa-pencil-square-o fa-fw mt-1" aria-hidden="true"></i>
  <div class="ml-4 w-full border border-teal-700">
    {#if data && data.content && data.contentType == 'text'}
      {data.content}
    {:else if data && data.content && data.contentType == 'html'}
      <div id="iframecontainer"></div>
    {/if}
  </div>
</div>

<script>
// Properties for the view
export let data = {}

// We might need to display an iframe
$: {
    if (data && data.content && data.contentType == 'html') {
        setTimeout(() => {
            const iframe = document.createElement('iframe')
            iframe.sandbox = '' // Disable JavaScript in the iframe and much more
            iframe.referrerPolicy = 'no-referrer'
            iframe.srcdoc = data.content
            iframe.style.height = '300px'
            iframe.style.width = '100%'
            document.getElementById('iframecontainer').appendChild(iframe)
        }, 0)
    }
}
</script>
