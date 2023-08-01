<template>
  <div>
    <p>Window Height: {{ height }}px</p>
    <p>Window Width: {{ width }}px</p>
  </div>
</template>

<script>
export default {
  name: 'WS',
  data() {
    return {
      height: window.innerHeight,
      width: window.innerWidth,
    };
  },
  mounted() {
    this.updateWindowSize();
    window.addEventListener('resize', this.updateWindowSize);
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.updateWindowSize);
  },
  methods: {
    updateWindowSize() {
      this.height = window.innerHeight;
      this.width = window.innerWidth;
    },
  },
};
</script>
