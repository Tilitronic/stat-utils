import { computed, ref, reactive } from 'vue';

export default function dimentionsCalculation(
  props,
  rowsHeight,
  columnsWidth,
  tableViewHeight,
  tableViewWidth,
) {
  // STATE
  const windowHeight = ref(window.innerHeight);
  const windowWidth = ref(window.innerWidth);
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
    hiddenArea,
    scrollArea,
    calculateHiddenArea,
    windowHeight,
    windowWidth,
  };
}
