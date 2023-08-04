<template>
  <q-page>
    <QSTable :columns="columns" :rows="rows"></QSTable>
  </q-page>
</template>

<script>
import QSTable from '../components/QSTableCapi.vue';

export default {
  components: { QSTable },
  data() {
    return {
      columns: 25,
      rows: 25,
    };
  },
};
</script>
