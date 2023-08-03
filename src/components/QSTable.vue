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
            <template :key="rowIndex" v-for="(row, rowIndex) in table">
              <tr v-if="visibleItems.rows.includes(rowIndex)">
                <template v-for="(cell, colIndex) in row" :key="colIndex">
                  <td
                    v-if="visibleItems.columns.includes(colIndex)"
                    @mousedown="handleCellMouseDown($event, rowIndex, colIndex)"
                    @mouseover="mouseMoveHandler($event, rowIndex, colIndex)"
                    @mouseup="handleCellMouseUp"
                    :class="{
                      selected: selectedCells[rowIndex][colIndex],
                    }"
                  >
                    <div
                      class="sInput"
                      @dblclick="handleDoubleClick(rowIndex, colIndex)"
                    >
                      <template v-if="editingCells[rowIndex][colIndex]">
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
                          {{ table[rowIndex][colIndex] }}
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
    <div>
      Window Height: {{ windowHeight }}px Window Width: {{ windowWidth }}px
    </div>
    <div>Scroll area w{{ scrollArea.width }}*h{{ scrollArea.height }}</div>
    <div>top: {{ hiddenArea.top }}; bottom: {{ hiddenArea.bottom }}</div>
    <div>left: {{ hiddenArea.left }}; right: {{ hiddenArea.right }}</div>
  </div>
</template>

<script>
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
      windowHeight: window.innerHeight,
      windowWidth: window.innerWidth,
      tableViewHeight: 0,
      tableViewWidth: 0,
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
    };
  },

  mounted() {
    this.updateWindowSize();
    window.addEventListener('resize', this.updateWindowSize);
    this.$nextTick(() => {
      const { tableVisibleArea } = this.$refs;
      if (tableVisibleArea) {
        this.tableViewHeight = tableVisibleArea.clientHeight;
        this.tableViewWidth = tableVisibleArea.clientWidth;
      }
    });
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.updateWindowSize);
  },
  computed: {
    visibleItems() {
      const rows = [];
      const columns = [];
      const avrgWidth = this.scrollArea.width / this.columns;
      const awrgHeight = this.scrollArea.height / this.rows;
      const { hiddenArea } = this;
      const { rowsHeight } = this;
      const { columnsWidth } = this;
      rowsHeight.reduce((a, v, i) => {
        const currentHeight = a + v;
        if (
          currentHeight >= hiddenArea.top
          && currentHeight <= hiddenArea.top + this.tableViewHeight
        ) {
          rows.push(i);
        }
        return a + v;
      }, 0);
      columnsWidth.reduce((a, v, i) => {
        const currentWidth = a + v;
        if (
          currentWidth >= hiddenArea.left
          && currentWidth - avrgWidth <= hiddenArea.left + this.tableViewWidth
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
        backgroundColor: 'green',
        pading: '0px',
        // transform: `translate(${this.hiddenArea.left}px, ${this.hiddenArea.top}px)`,
      };
    },
    scrollArea() {
      return {
        height: this.rowsHeight.reduce((a, b) => a + b, 0),
        width: this.columnsWidth.reduce((a, b) => a + b, 0),
      };
    },
  },
  methods: {
    updateWindowSize() {
      this.windowHeight = window.innerHeight;
      this.windowWidth = window.innerWidth;
      const { tableVisibleArea } = this.$refs;
      if (tableVisibleArea) {
        this.tableViewHeight = tableVisibleArea.clientHeight;
        this.tableViewWidth = tableVisibleArea.clientWidth;
      }
    },
    handleScroll(event) {
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

      this.hiddenArea.top = pixelsHiddenTop;
      this.hiddenArea.bottom = pixelsHiddenBottom;
      this.hiddenArea.left = pixelsHiddenLeft;
      this.hiddenArea.right = pixelsHiddenRight;
    },
    createTable(rows, cols, fillValue = null) {
      const table = new Array(rows);
      for (let i = 0; i < rows; i++) {
        table[i] = new Array(cols).fill(fillValue);
      }
      return table;
    },
    updateInput(event, rowI, colI) {
      this.table[rowI][colI] = this.formatValue(event.target.value);
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
      this.editingCells[rowIndex][colIndex] = true;
      this.$nextTick(() => {
        this.$refs[`input${rowIndex}${colIndex}`][0].focus();
      });
    },
    handleKeyPress(event, rowIndex, colIndex) {
      if (event.key === 'Enter') {
        // this.$emit('update:modelValue', this.innerModel);
        this.editingCells[rowIndex][colIndex] = false;
        this.delayedTable[rowIndex][colIndex] = this.table[rowIndex][colIndex];
      } else if (event.key === 'Escape') {
        this.table[rowIndex][colIndex] = this.delayedTable[rowIndex][colIndex];
        this.editingCells[rowIndex][colIndex] = false;
      }
    },
    handleBlur(rowIndex, colIndex) {
      this.delayedTable[rowIndex][colIndex] = this.table[rowIndex][colIndex];
      this.editingCells[rowIndex][colIndex] = false;
    },
    isSelected(rowIndex, columnIndex) {
      return this.selectedCells[rowIndex][columnIndex];
    },
    handleCellMouseDown(event, rowIndex, columnIndex) {
      // event.preventDefault();
      this.dragging = true;
      this.startRow = rowIndex;
      this.startCol = columnIndex;
      this.selectedCells = this.createTable(this.rows, this.columns, false);
      this.selectedCells[rowIndex][columnIndex] = true;
    },
    mouseMoveHandler(event, rowIndex, columnIndex) {
      if (this.dragging) {
        const startRow = Math.min(this.startRow, rowIndex);
        const startCol = Math.min(this.startCol, columnIndex);
        const endRow = Math.max(this.startRow, rowIndex);
        const endCol = Math.max(this.startCol, columnIndex);
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

        this.selectedCells = newSelectedCells;
      }
    },
    handleCellMouseUp() {
      this.dragging = false;
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
  position: relative;
}

.virtualTableWrapper {
  position: sticky;
  top: 0;
  left: 0;
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
