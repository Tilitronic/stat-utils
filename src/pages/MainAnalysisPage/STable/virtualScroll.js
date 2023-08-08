import { computed, reactive } from 'vue';

export default function virtualScroll(
  props,
  rowsHeight,
  columnsWidth,
  tableViewHeight,
  tableViewWidth,
) {
  // STATE
  const hiddenArea = reactive({
    top: null,
    bottom: null,
    left: null,
    right: null,
  });

  // COMPUTED
  const scrollArea = computed(() => ({
    height: rowsHeight.value.reduce((a, b) => a + b, 0),
    width: columnsWidth.value.reduce((a, b) => a + b, 0),
  }));

  const visibleItems = computed(() => {
    const rows = [];
    const columns = [];
    const avrgWidth = scrollArea.value.width / props.columns;
    const avrgHeight = scrollArea.value.height / props.rows;
    rowsHeight.value.reduce((a, v, i) => {
      const currentHeight = a + v;
      if (
        currentHeight > hiddenArea.top
        && currentHeight + avrgHeight < hiddenArea.top + tableViewHeight.value
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

  // METHODS
  function calculateHiddenArea(event) {
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

  return {
    visibleItems,
  };
}
