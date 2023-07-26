<template>
    <q-page class="row items-center justify-evenly">
        <div>
            <p>{{ string }}</p>
        </div>
    </q-page>
</template>

<script lang="ts">
export default {
  name: 'summaryMeasures',
  data() {
    return {
      string: 'STRING',
    };
  },
};
</script>

<style>
    p{
            width: 300px;
            height: 300px;
            background-color: red;
    }
</style>
