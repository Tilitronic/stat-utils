<template>
  <div>
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
                      @mousedown="
                        handleCellMouseDown($event, rowIndex, colIndex)
                      "
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
                            :ref="inputRefs[`input${rowIndex}${colIndex}`]"
                            class="sInput"
                            :value="row[colIndex]"
                            @input="updateInput($event, rowIndex, colIndex)"
                            @blur="handleBlur(rowIndex, colIndex)"
                            @keydown="
                              handleKeyPress($event, rowIndex, colIndex)
                            "
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
      <div>rows: {{ rows }}, columns: {{ columns }}</div>
    </div>
  </div>
</template>

<script setup>
import {
  ref, reactive, computed, onMounted, onUnmounted, nextTick,
} from 'vue';

const props = defineProps({
  // Use defineProps to access props
  columns: {
    type: Number,
    default: 26,
  },
  rows: {
    type: Number,
    default: 99,
  },
});
// const { rows, columns } = props;

const tableVisibleArea = ref(null);
const inputRefs = reactive({});

const windowHeight = ref(window.innerHeight);
const windowWidth = ref(window.innerWidth);
const tableViewHeight = ref(0);
const tableViewWidth = ref(0);
const table = ref(createTable(props.rows, props.columns, 0));
const delayedTable = ref(createTable(props.rows, props.columns, 0));
const selectedCells = ref(createTable(props.rows, props.columns));
const editingCells = ref(createTable(props.rows, props.columns, false));
const dragging = ref(false);
const startRow = ref(-1);
const startCol = ref(-1);
const rowsHeight = ref(new Array(props.rows).fill(35));
const columnsWidth = ref(new Array(props.columns).fill(100));
const hiddenArea = reactive({
  top: null,
  bottom: null,
  left: null,
  right: null,
});

onMounted(() => {
  updateWindowSize();
  window.addEventListener('resize', updateWindowSize);
  if (tableVisibleArea.value) {
    tableViewHeight.value = tableVisibleArea.value.clientHeight;
    tableViewWidth.value = tableVisibleArea.value.clientWidth;
  }
});

onUnmounted(() => {
  window.removeEventListener('resize', updateWindowSize);
});

const visibleItems = computed(() => {
  const rows = [];
  const columns = [];
  const avrgWidth = scrollArea.value.width / columns;
  // const awrgHeight = scrollArea.height / rows;
  rowsHeight.value.reduce((a, v, i) => {
    const currentHeight = a + v;
    if (
      currentHeight >= hiddenArea.top
      && currentHeight <= hiddenArea.top + tableViewHeight.value
    ) {
      rows.push(i);
    }
    return a + v;
  }, 0);
  columnsWidth.value.reduce((a, v, i) => {
    const currentWidth = a + v;
    if (
      currentWidth >= hiddenArea.left
      && currentWidth - avrgWidth <= hiddenArea.left + tableViewWidth.value
    ) {
      columns.push(i);
    }
    return a + v;
  }, 0);
  return {
    rows,
    columns,
  };
});

const visibleDataStyle = computed(() => ({
  width: 'fit-content',
  height: 'fit-content',
  backgroundColor: 'green',
  pading: '0px',
}));

const scrollArea = computed(() => ({
  height: rowsHeight.value.reduce((a, b) => a + b, 0),
  width: columnsWidth.value.reduce((a, b) => a + b, 0),
}));

function updateWindowSize() {
  windowHeight.value = window.innerHeight;
  windowWidth.value = window.innerWidth;
  if (tableVisibleArea.value) {
    tableViewHeight.value = tableVisibleArea.value.clientHeight;
    tableViewWidth.value = tableVisibleArea.value.clientWidth;
  }
}

function handleScroll(event) {
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

  hiddenArea.top = pixelsHiddenTop;
  hiddenArea.bottom = pixelsHiddenBottom;
  hiddenArea.left = pixelsHiddenLeft;
  hiddenArea.right = pixelsHiddenRight;
}

function createTable(rows, cols, fillValue = null) {
  const table = new Array(rows);
  for (let i = 0; i < rows; i++) {
    table[i] = new Array(cols).fill(fillValue);
  }
  return table;
}

function updateInput(event, rowI, colI) {
  table.value[rowI][colI] = formatValue(event.target.value);
}

function formatValue(value) {
  if (value === null) {
    return null;
  }
  if (/^\s/.test(value)) {
    return '';
  }
  return value.trim().replace(/ +/g, ' ');
}

function handleDoubleClick(rowIndex, colIndex) {
  editingCells.value[rowIndex][colIndex] = true;
  nextTick(() => {
    inputRefs[`input${rowIndex}${colIndex}`][0].focus();
  });
}

function handleKeyPress(event, rowIndex, colIndex) {
  if (event.key === 'Enter') {
    // this.$emit('update:modelValue', this.innerModel);
    editingCells.value[rowIndex][colIndex] = false;
    delayedTable.value[rowIndex][colIndex] = table.value[rowIndex][colIndex];
  } else if (event.key === 'Escape') {
    table.value[rowIndex][colIndex] = delayedTable.value[rowIndex][colIndex];
    editingCells.value[rowIndex][colIndex] = false;
  }
}

function handleBlur(rowIndex, colIndex) {
  delayedTable.value[rowIndex][colIndex] = table.value[rowIndex][colIndex];
  editingCells.value[rowIndex][colIndex] = false;
}

function isSelected(rowIndex, columnIndex) {
  return selectedCells.value[rowIndex][columnIndex];
}

function handleCellMouseDown(event, rowIndex, columnIndex) {
  dragging.value = true;
  startRow.value = rowIndex;
  startCol.value = columnIndex;
  selectedCells.value = createTable(props.rows, props.columns, false);
  selectedCells.value[rowIndex][columnIndex] = true;
}

function mouseMoveHandler(event, rowIndex, columnIndex) {
  if (dragging.value) {
    const startRowI = Math.min(startRow.value, rowIndex);
    const startColI = Math.min(startCol.value, columnIndex);
    const endRow = Math.max(startRow.value, rowIndex);
    const endCol = Math.max(startCol.value, columnIndex);
    const newSelectedCells = createTable(props.rows, props.columns, false);
    for (let i = startRowI; i <= endRow; i++) {
      for (let j = startColI; j <= endCol; j++) {
        newSelectedCells[i][j] = true;
      }
    }

    selectedCells.value = newSelectedCells;
  }
}

function handleCellMouseUp() {
  dragging.value = false;
}
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
