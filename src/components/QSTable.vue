<template>
  <div class="sTableWrapper" @scroll="handleScroll" ref="tableVisibleArea">
    <div
      class="taleScrollArea"
      :style="{
        width: scrollArea.width + 'px',
        height: scrollArea.height + 'px',
      }"
    >
      <div class="virtualTableWrapper" :style="visibleDataStyle">
        <table>
          <tbody>
            <template :key="rowIndex" v-for="(row, rowIndex) in state.table">
              <tr v-if="visibleItems.rows.includes(rowIndex)">
                <template v-for="(cell, colIndex) in row" :key="colIndex">
                  <td
                    v-if="visibleItems.columns.includes(colIndex)"
                    @mousedown="handleCellMouseDown($event, rowIndex, colIndex)"
                    @mouseover="mouseMoveHandler($event, rowIndex, colIndex)"
                    @mouseup="handleCellMouseUp"
                    :class="{
                      selected: state.selectedCells[rowIndex][colIndex],
                    }"
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
                  </td>
                </template>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
    </div>
  </div>
  <div>
    <div>Scroll area w{{ scrollArea.width }}*h{{ scrollArea.height }}</div>
    <div>
      top: {{ state.hiddenArea.top }}; bottom: {{ state.hiddenArea.bottom }}
    </div>
    <div>
      left: {{ state.hiddenArea.left }}; right: {{ state.hiddenArea.right }}
    </div>
    <div>Visible area w{{ visibleArea.width }}*h{{ visibleArea.height }}</div>
  </div>
</template>

<script>
import { reactive } from 'vue';

export default {
  name: 'QSTable',
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
      visibleHeight: 0,
      visibleWidth: 0,
      state: reactive({
        table: this.createTable(this.rows, this.columns, 0),
        delayedTable: this.createTable(this.rows, this.columns, 0),
        selectedCells: this.createTable(this.rows, this.columns),
        isMouseDown: false,
        editingCells: this.createTable(this.rows, this.columns, false),
        dragging: false,
        startRow: -1,
        startCol: -1,
        rowsHeight: new Array(this.rows).fill(35),
        columnsWidth: new Array(this.columns).fill(100),
        hiddenArea: {
          top: null,
          bottom: null,
          left: null,
          right: null,
        },
        visibleAreaDate: {
          width: null,
          height: null,
        },
      }),
    };
  },

  mounted() {
    this.$nextTick(() => {
      const { tableVisibleArea } = this.$refs;
      this.state.visibleAreaDate.height = tableVisibleArea.clientHeight;
      this.state.visibleAreaDate.width = tableVisibleArea.clientWidth;
      this.visibleHeight = tableVisibleArea.clientHeight;
      this.visibleWidth = tableVisibleArea.clientWidth;
    });
    this.updateWindowSize();
    window.addEventListener('resize', this.updateWindowSize);
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.updateWindowSize);
  },
  computed: {
    visibleItems() {
      const rows = [];
      const columns = [];
      // const avrgWidth = this.visibleArea.width / this.columns.length;
      // const awrgHeight = this.visibleArea.height / this.rows.length;
      const { hiddenArea, rowsHeight, columnsWidth } = this.state;
      rowsHeight.reduce((a, v, i) => {
        const currentHeight = a + v;
        if (
          currentHeight >= hiddenArea.top
          && currentHeight <= hiddenArea.top + this.visibleArea.height
        ) {
          rows.push(i);
        }
        return a + v;
      }, 0);
      columnsWidth.reduce((a, v, i) => {
        const currentWidth = a + v;
        if (
          currentWidth >= hiddenArea.left
          && currentWidth <= hiddenArea.left + this.visibleArea.width
        ) {
          columns.push(i);
        }
        return a + v;
      }, 0);
      return {
        rows,
        columns,
      };
    },
    visibleDataStyle() {
      return {
        width: 'fit-content',
        height: 'fit-content',
        backgroundColor: 'red',
        pading: '0px',
        transform: `translate(${this.state.hiddenArea.left}px, ${this.state.hiddenArea.top}px)`,
      };
    },
    scrollArea() {
      return {
        height: this.state.rowsHeight.reduce((a, b) => a + b, 0),
        width: this.state.columnsWidth.reduce((a, b) => a + b, 0),
      };
    },
    visibleArea() {
      let height = 0;
      let width = 0;

      if (
        this.state.hiddenArea.top === null
        && this.state.visibleAreaDate.height
        && this.state.visibleAreaDate.width
      ) {
        height = this.state.visibleAreaDate.height;
        width = this.state.visibleAreaDate.width;
      } else if (this.state.visibleAreaDate.top !== null) {
        height = this.scrollArea.height
          - (this.state.hiddenArea.top + this.state.hiddenArea.bottom);
        width = this.scrollArea.width
          - (this.state.hiddenArea.left + this.state.hiddenArea.right);
      }
      return {
        height,
        width,
      };
    },
  },
  methods: {
    updateWindowSize() {
      this.visibleHeight = window.innerHeight;
      this.visibleWidth = window.innerWidth;
    },
    // updateVisibleAreaSize() {
    //   console.log('size changed');
    //   const { tableVisibleArea } = this.$refs;
    //   console.log(tableVisibleArea.clientHeight, tableVisibleArea.clientWidth);
    //   console.log(window.innerHeight, window.innerWidth);
    //   // this.visibleWidth = window.innerWidth;
    //   // this.visibleHeight = window.innerHeight;
    //   this.state.visibleAreaSize.height = window.innerHeight;
    // },
    handleScroll(event) {
      // Calculate the number of pixels hidden from each side
      const { scrollTop } = event.target;
      const { scrollLeft } = event.target;
      const { scrollHeight } = event.target;
      const { scrollWidth } = event.target;
      const { clientHeight } = event.target;
      const { clientWidth } = event.target;

      const pixelsHiddenTop = scrollTop;
      const pixelsHiddenBottom = scrollHeight - clientHeight - scrollTop;
      const pixelsHiddenLeft = scrollLeft;
      const pixelsHiddenRight = scrollWidth - clientWidth - scrollLeft;

      this.state.hiddenArea.top = pixelsHiddenTop;
      this.state.hiddenArea.bottom = pixelsHiddenBottom;
      this.state.hiddenArea.left = pixelsHiddenLeft;
      this.state.hiddenArea.right = pixelsHiddenRight;
    },
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
