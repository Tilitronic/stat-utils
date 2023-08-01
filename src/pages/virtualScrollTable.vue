<template>
  <q-page>
    <QSTable :columns="columns" :rows="rows"></QSTable>
  </q-page>
</template>

<script>
import QSTable from '../components/QSTable.vue';

export default {
  components: { QSTable },
  data() {
    return {
      columns: 200,
      rows: 200,
    };
  },
};
</script>
