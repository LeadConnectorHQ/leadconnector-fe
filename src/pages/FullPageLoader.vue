<script setup lang="ts">
import { UISkeleton , UISpace } from '@/ui';


</script>

<template>
    <div class='loader'>
        <div class="pr-5">
            <UISkeleton height="40px" width="20%" />
        </div>
        <div class='py-5 pr-5 flex flex-col'>
            <UISkeleton height="40px"  />
        </div>
    
        <div class='py-5 flex flex-col'>
            <UISkeleton height="40px" class="w-1/3 d-block" rounded />
            <UISkeleton height="40px" class="w-1/3 d-block mt-3" rounded />
            <UISkeleton height="40px" class="w-1/3 d-block mt-3" rounded />
            <UISkeleton height="40px" class="w-1/3 d-block mt-3" rounded />
        </div>
    </div>
</template>

<style>
.loader {
    padding: 50px ;
    padding-right: 200px ;
}

</style>
