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
            <div
              class="sInput"
              @dblclick="handleDoubleClick(rowIndex, colIndex)"
            >
              <template v-if="state.editingCells[rowIndex][colIndex]">
                <input
                  :ref="`input${rowIndex}${colIndex}`"
                  class="sInput"
                  :value="row[colIndex]"
                  @input="updateInput($event, rowIndex, colIndex)"
                  @blur="handleBlur(rowIndex, colIndex)"
                  @keydown="handleKeyPress($event, rowIndex, colIndex)"
                />
              </template>

              <template v-else>
                <p class="cellLabel prevent-select">
                  {{ state.table[rowIndex][colIndex] }}
                </p>
              </template>
            </div>
            <!-- <SInput v-model="row[colIndex]" :isSelected="state.selectedCells[rowIndex][colIndex]">
            </SInput> -->
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import { reactive } from 'vue';
// import SInput from './SInput.vue';

export default {
  name: 'STable',
  // components: { SInput },
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
        delayedTable: this.createTable(this.rows, this.columns, 0),
        selectedCells: this.createTable(this.rows, this.columns),
        isMouseDown: false,
        // editingCell: null,
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
    updateInput(event, rowI, colI) {
      this.state.table[rowI][colI] = this.formatValue(event.target.value);
    },
    formatValue(value) {
      if (value === null) {
        return null;
      }
      if (/^\s/.test(value)) {
        return '';
      }
      return value.trim().replace(/ +/g, ' ');
    },
    handleDoubleClick(rowIndex, colIndex) {
      this.state.editingCells[rowIndex][colIndex] = true;
      this.$nextTick(() => {
        this.$refs[`input${rowIndex}${colIndex}`][0].focus();
      });
    },
    handleKeyPress(event, rowIndex, colIndex) {
      if (event.key === 'Enter') {
        // this.$emit('update:modelValue', this.innerModel);
        this.state.editingCells[rowIndex][colIndex] = false;
        this.state.delayedTable[rowIndex][colIndex] = this.state.table[rowIndex][colIndex];
      } else if (event.key === 'Escape') {
        this.state.table[rowIndex][colIndex] = this.state.delayedTable[rowIndex][colIndex];
        this.state.editingCells[rowIndex][colIndex] = false;
      }
    },
    handleBlur(rowIndex, colIndex) {
      this.state.delayedTable[rowIndex][colIndex] = this.state.table[rowIndex][colIndex];
      this.state.editingCells[rowIndex][colIndex] = false;
    },
    isSelected(rowIndex, columnIndex) {
      return this.state.selectedCells[rowIndex][columnIndex];
    },
    handleCellMouseDown(event, rowIndex, columnIndex) {
      // event.preventDefault();
      this.state.dragging = true;
      this.state.startRow = rowIndex;
      this.state.startCol = columnIndex;
      this.state.selectedCells = this.createTable(
        this.rows,
        this.columns,
        false,
      );
      this.state.selectedCells[rowIndex][columnIndex] = true;
    },
    mouseMoveHandler(event, rowIndex, columnIndex) {
      if (this.state.dragging) {
        const startRow = Math.min(this.state.startRow, rowIndex);
        const startCol = Math.min(this.state.startCol, columnIndex);
        const endRow = Math.max(this.state.startRow, rowIndex);
        const endCol = Math.max(this.state.startCol, columnIndex);
        const newSelectedCells = this.createTable(
          this.rows,
          this.columns,
          false,
        );
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

.sInput {
  max-width: 100px;
  max-height: 35px;
  min-height: 35px;
  min-width: 100px;
}
.sInput input {
  max-width: 100%;
}

.cellLabel {
  max-width: 100%;
  padding: 0;
  overflow: hidden;
}
</style>
