import { ref } from 'vue';

export default function navigationAndSelection(
  props,
  createTable,
  dragging,
  startRow,
  startCol,
  editingCoordinate,
  isCtrl,
  isShift,
) {
  // STATE
  const selectedCells = ref(createTable(props.rows, props.columns));
  const lastTouchedCell = ref('');

  // COMPUTED

  // METHODS
  function selectionOnMouseDown(rowIndex, columnIndex) {
    dragging.value = true;
    startRow.value = rowIndex;
    startCol.value = columnIndex;
    lastTouchedCell.value = `${rowIndex},${columnIndex}`;
    selectedCells.value = createTable(props.rows, props.columns, false);
    selectedCells.value[rowIndex][columnIndex] = true;
  }

  function selectionOnMouseMove(rowIndex, columnIndex) {
    if (dragging.value) {
      const startRowI = Math.min(startRow.value, rowIndex);
      const startColI = Math.min(startCol.value, columnIndex);
      const endRow = Math.max(startRow.value, rowIndex);
      const endCol = Math.max(startCol.value, columnIndex);
      lastTouchedCell.value = `${rowIndex},${columnIndex}`;
      const newSelectedCells = createTable(props.rows, props.columns, false);
      for (let i = startRowI; i <= endRow; i++) {
        for (let j = startColI; j <= endCol; j++) {
          newSelectedCells[i][j] = true;
        }
      }

      selectedCells.value = newSelectedCells;
    }
  }
  return {
    selectedCells,
    selectionOnMouseDown,
    selectionOnMouseMove,
    lastTouchedCell,
  };
}
