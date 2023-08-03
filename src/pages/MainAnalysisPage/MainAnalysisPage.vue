<template>
  <q-page>
    <STable :columns="columns" :rows="rows"></STable>
  </q-page>
</template>

<script>
import STable from './STable/STable.vue';

export default {
  components: { STable },
  data() {
    return {
      columns: 200,
      rows: 200,
    };
  },
};
</script>
