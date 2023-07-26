<template>
  <div class="sInput" @dblclick="handleDoubleClick">
    <template v-if="editing">
      <input
        ref="input"
        class="sInput"
        :type="type"
        :value="innerModel"
        @input="updateInput"
        @blur="handleBlur"
        @keydown="handleKeyPress"
      />
    </template>
    <template v-else>
      <p class="cellLabel prevent-select">{{ innerModel }}</p>
    </template>
  </div>
</template>

<script>
export default {
  name: 'SInput',
  props: {
    modelValue: {
      type: null,
      default: null,
    },
    type: {
      type: String,
      default: 'text',
    },
    isSelected: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      editing: false,
      innerModel: this.modelValue,
    };
  },
  watch: {
    isSelected(nV) {
      if (nV === false) {
        this.editing = false;
      }
    },
  },
  methods: {
    updateInput(event) {
      this.innerModel = this.formatValue(event.target.value);
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
    handleDoubleClick() {
      this.editing = true;
      this.$nextTick(() => {
        this.$refs.input.focus();
      });
    },
    handleKeyPress(event) {
      if (event.key === 'Enter') {
        this.$emit('update:modelValue', this.innerModel);
        this.editing = false;
      } else if (event.key === 'Escape') {
        this.innerModel = this.modelValue;
        this.editing = false;
      }
    },
    handleBlur() {
      this.$emit('update:modelValue', this.innerModel);
      this.editing = false;
    },
  },
};
</script>

<style>
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
