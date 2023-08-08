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
                        @dblclick="
                          handleDoubleClick($event, rowIndex, colIndex)
                        "
                      >
                        <template
                          v-if="editingCoordinate === rowIndex + ',' + colIndex"
                        >
                          <input
                            :ref="
                              (el) => {
                                inputRefs[`input${rowIndex}${colIndex}`] = el;
                              }
                            "
                            class="sInput"
                            :value="row[colIndex]"
                            @input="updateInput($event, rowIndex, colIndex)"
                            @blur="handleBlur($event, rowIndex, colIndex)"
                            @keydown="
                              handleInputKeyPress($event, rowIndex, colIndex)
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

import virtualScroll from './virtualScroll';
import dimentionsCalculation from './dimentionsCalculation';
import navigationAndSelection from './navigationAndSelection';

const props = defineProps({
  columns: {
    type: Number,
    default: 26,
  },
  rows: {
    type: Number,
    default: 99,
  },
});

const tableVisibleArea = ref(null);
const inputRefs = reactive({});

const tableViewHeight = ref(0);
const tableViewWidth = ref(0);
const table = ref(createTable(props.rows, props.columns, 0));
const delayedTable = ref(createTable(props.rows, props.columns, 0));
const editingCoordinate = ref('');
const dragging = ref(false);
const startRow = ref(-1);
const startCol = ref(-1);
const rowsHeight = ref(new Array(props.rows).fill(35));
const columnsWidth = ref(new Array(props.columns).fill(100));
const isCtrl = ref(false);
const isShift = ref(false);

onMounted(() => {
  updateWindowSize();
  window.addEventListener('resize', updateWindowSize);
  // document.addEventListener('keydown', handleDocumentKeyPress);
  if (tableVisibleArea.value) {
    tableViewHeight.value = tableVisibleArea.value.clientHeight;
    tableViewWidth.value = tableVisibleArea.value.clientWidth;
  }
});

onUnmounted(() => {
  window.removeEventListener('resize', updateWindowSize);
  // document.addEventListener('keydown', handleDocumentKeyPress);
});

const visibleDataStyle = computed(() => ({
  width: 'fit-content',
  height: 'fit-content',
  backgroundColor: 'green',
  pading: '0px',
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
  calculateHiddenArea(event);
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

function handleDoubleClick(event, rowIndex, colIndex) {
  editingCoordinate.value = `${rowIndex},${colIndex}`;
  nextTick(() => {
    inputRefs[`input${rowIndex}${colIndex}`].focus();
  });
}

function handleInputKeyPress(event, rowIndex, colIndex) {
  if (event.key === 'Enter') {
    editingCoordinate.value = '';
    delayedTable.value[rowIndex][colIndex] = table.value[rowIndex][colIndex];
  } else if (event.key === 'Escape') {
    table.value[rowIndex][colIndex] = delayedTable.value[rowIndex][colIndex];
    editingCoordinate.value = '';
  }
}

function handleBlur(event, rowIndex, colIndex) {
  delayedTable.value[rowIndex][colIndex] = table.value[rowIndex][colIndex];
  editingCoordinate.value = '';
}

function handleCellMouseDown(event, rowIndex, columnIndex) {
  selectionOnMouseDown(rowIndex, columnIndex);
}

function mouseMoveHandler(event, rowIndex, columnIndex) {
  selectionOnMouseMove(rowIndex, columnIndex);
}

function handleCellMouseUp() {
  dragging.value = false;
}

// function handleDocumentKeyPress(event) {
//   // event.preventDefault();
//   console.log('!!!!!!!!!!!!', event.key);
//   if (!lastTouchedCell.value || editingCoordinate.value) {
//     return;
//   }
//   // event.key === 'Enter'
//   // event.key === 'Tab'
//   const [rowCoor, colCoor] = lastTouchedCell.value.split(',');

//   if (event.key === 'ArrowDown') {
//     event.preventDefault();
//     const rowBelow = parseInt(rowCoor, 10) + 1;
//     console.log(rowBelow <= props.rows, rowBelow);
//     console.log(selectedCells.value[rowBelow]);
//     if (rowBelow <= props.columns) {
//       selectedCells.value[rowCoor][colCoor] = false;
//       selectedCells.value[rowBelow][colCoor] = true;
//       lastTouchedCell.value = `${rowBelow},${colCoor}`;
//     }
//   } else if (event.key === 'Up') {
//     console.log(rowCoor);
//   } else if (event.key === 'Left') {
//     console.log(rowCoor);
//   } else if (event.key === 'Right') {
//     console.log(rowCoor);
//   }
// }

const {
  hiddenArea,
  scrollArea,
  calculateHiddenArea,
  windowHeight,
  windowWidth,
} = dimentionsCalculation(
  props,
  rowsHeight,
  columnsWidth,
  tableViewHeight,
  tableViewWidth,
);

const { visibleItems } = virtualScroll(
  props,
  rowsHeight,
  columnsWidth,
  tableViewHeight,
  tableViewWidth,
);

const {
  selectedCells,
  selectionOnMouseDown,
  selectionOnMouseMove,
  lastTouchedCell,
} = navigationAndSelection(
  props,
  createTable,
  dragging,
  startRow,
  startCol,
  editingCoordinate,
  isCtrl,
  isShift,
);
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
