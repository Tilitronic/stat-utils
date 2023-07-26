<template>
  <div class="sTableWrapper">
    <table>
      <tbody>
        <tr v-for="(row, rowIndex) in state.table" :key="rowIndex">
          <td
            v-for="(cell, colIndex) in row"
            :key="colIndex"
            @mousedown="handleCellMouseDown($event, rowIndex, colIndex)"
            @mouseover="mouseMoveHandler($event, rowIndex, colIndex)"
            @mouseup="handleCellMouseUp"
            :class="{ selected: state.selectedCells[rowIndex][colIndex] }"
          >
            <SInput v-model="row[colIndex]" :isSelected="state.selectedCells[rowIndex][colIndex]">
            </SInput>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import { reactive } from 'vue';
import SInput from './SInput.vue';

export default {
  name: 'STable',
  components: { SInput },
  props: {
    columns: {
      type: Number,
      default: 26,
    },
    rows: {
      type: Number,
      default: 99,
    },
  },
  data() {
    return {
      state: reactive({
        table: this.createTable(this.rows, this.columns, 0),
        selectedCells: this.createTable(this.rows, this.columns),
        isMouseDown: false,
        editingCell: null,
        editingCells: this.createTable(this.rows, this.columns, false),
        dragging: false,
        startRow: -1,
        startCol: -1,
        rowsHeight: new Array(this.rows).fill(35),
        columnsWidth: new Array(this.columns).fill(100),
      }),
    };
  },
  methods: {
    createTable(rows, cols, fillValue = null) {
      const table = new Array(rows);
      for (let i = 0; i < rows; i++) {
        table[i] = new Array(cols).fill(fillValue);
      }
      return table;
    },
    handleCellInput(rowIndex, columnIndex, value) {
      console.log(rowIndex, columnIndex, value);
      this.state.table[rowIndex][columnIndex] = value;
    },
    isSelected(rowIndex, columnIndex) {
      return this.state.selectedCells[rowIndex][columnIndex];
    },
    isEditing(rowIndex, columnIndex) {
      return this.state.editingCells[rowIndex][columnIndex];
    },
    editCell(rowIndex, columnIndex) {
      this.state.editingCells = this.createTable(this.rows, this.columns, false);
      this.state.editingCells[rowIndex][columnIndex] = true;
    },
    handleCellMouseDown(event, rowIndex, columnIndex) {
      // event.preventDefault();
      this.state.dragging = true;
      this.state.startRow = rowIndex;
      this.state.startCol = columnIndex;
      this.state.selectedCells = this.createTable(this.rows, this.columns, false);
      this.state.selectedCells[rowIndex][columnIndex] = true;
    },
    mouseMoveHandler(event, rowIndex, columnIndex) {
      if (this.state.dragging) {
        console.log('!');
        const startRow = Math.min(this.state.startRow, rowIndex);
        const startCol = Math.min(this.state.startCol, columnIndex);
        const endRow = Math.max(this.state.startRow, rowIndex);
        const endCol = Math.max(this.state.startCol, columnIndex);
        const newSelectedCells = this.createTable(this.rows, this.columns, false);
        for (let i = startRow; i <= endRow; i++) {
          for (let j = startCol; j <= endCol; j++) {
            newSelectedCells[i][j] = true;
          }
        }

        this.state.selectedCells = newSelectedCells;
      }
    },
    handleCellMouseUp() {
      this.state.dragging = false;
    },
  },
};
</script>

<style>
.sTableWrapper {
  max-width: 80vw;
  max-height: 80vh;
  min-width: 300px;
  min-height: 200px;
  overflow-y: scroll;
  overflow-x: scroll;
}
.selected {
  background-color: blue;
}
</style>
