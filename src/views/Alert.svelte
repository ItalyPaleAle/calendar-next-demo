<div class="w-full sm:w-3/4 md:w-2/3 mx-auto mb-6">
  <div class="border-t-4 mx-4 rounded-b px-4 py-3 shadow-md {classContainer}" role="alert">
    <div class="flex">
      <div class="py-1">
        <span class="fa-stack mr-4 {classIcon}">
          <i class="fa fa-circle-o fa-stack-2x"></i>
          <i class="fa fa-info fa-stack-1x"></i>
        </span>
      </div>
      <div>
        <p class="font-bold">{content}</p>
        {#if detail}
          <p class="text-sm">{detail}</p>
        {/if}
      </div>
    </div>
  </div>
</div>

<script>
export let color = 'teal'
export let content = ''
export let detail = false

let classContainer = ''
let classIcon = ''
$: {
    switch (color) {
        case 'orange':
            classContainer = 'bg-orange-100 border-orange-500 text-orange-900'
            classIcon = 'text-orange-500'
            break

        case 'teal':
        default:
            classContainer = 'bg-teal-100 border-teal-500 text-teal-900'
            classIcon = 'text-teal-500'
            break
    }
}
</script>