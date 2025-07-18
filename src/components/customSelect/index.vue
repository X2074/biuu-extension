<template>
    <div class="custom-select" :class="{ 'is-open': isOpen }" v-click-outside="closeDropdown">
      <div class="select-header" @click="toggleDropdown">
        <span v-if="!selectedOption">请选择</span>
        <span v-else>{{ getOptionLabel(selectedOption) }}</span>
        <span class="arrow" :class="{ 'arrow-up': isOpen }">▼</span>
      </div>
      <div v-if="isOpen" class="select-options">
        <div 
          v-for="(option, index) in options" 
          :key="index"
          class="select-option"
          :class="{ 'is-selected': isSelected(option) }"
          @click="selectOption(option)"
        >
          {{ getOptionLabel(option) }}
        </div>
      </div>
      <input type="hidden" :name="name" :value="selectedValue" />
    </div>
  </template>
  <script setup>
  import { ref, computed } from 'vue';
  
  const props = defineProps({
    modelValue: [String, Number, Object],
    options: {
      type: Array,
      default: () => []
    },
    optionLabel: {
      type: String,
      default: 'label'
    },
    optionValue: {
      type: String,
      default: 'value'
    },
    placeholder: {
      type: String,
      default: '请选择'
    },
    name: String
  });
  
  const emit = defineEmits(['update:modelValue', 'change']);
  
  const isOpen = ref(false);
  const selectedOption = ref(props.modelValue);
  
  const selectedValue = computed(() => {
    if (!selectedOption.value) return '';
    return typeof selectedOption.value === 'object' 
      ? selectedOption.value[props.optionValue] 
      : selectedOption.value;
  });
  
  const toggleDropdown = () => {
    isOpen.value = !isOpen.value;
  };
  
  const closeDropdown = () => {
    isOpen.value = false;
  };
  
  const selectOption = (option) => {
    selectedOption.value = option;
    emit('update:modelValue', option);
    emit('change', option);
    closeDropdown();
  };
  
  const isSelected = (option) => {
    if (!selectedOption.value) return false;
    const optionVal = typeof option === 'object' ? option[props.optionValue] : option;
    const selectedVal = typeof selectedOption.value === 'object' 
      ? selectedOption.value[props.optionValue] 
      : selectedOption.value;
    return optionVal === selectedVal;
  };
  
  const getOptionLabel = (option) => {
    if (!option) return '';
    return typeof option === 'object' ? option[props.optionLabel] : option;
  };
  </script>
  
  <style scoped>
  .custom-select {
    position: relative;
    width: 100%;
    font-size: 14px;
    color: #333;
  }
  
  .select-header {
    padding: 10px 15px;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: #fff;
    transition: border-color 0.3s;
  }
  .select-header span{
      font-size: 14px;
    }
  
  .select-header:hover {
    border-color: #c0c4cc;
  }
  
  .arrow {
    transition: transform 0.3s;
    font-size: 12px;
    color: #c0c4cc;
  }
  
  .arrow-up {
    transform: rotate(180deg);
  }
  
  .select-options {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    max-height: 200px;
    overflow-y: auto;
    border: 1px solid #e4e7ed;
    border-radius: 4px;
    background-color: #fff;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    z-index: 1000;
    margin-top: 5px;
  }
  
  .select-option {
    padding: 10px 15px;
    cursor: pointer;
    font-size: 14px;
    transition: background-color 0.3s;
  }
  
  .select-option:hover {
    background-color: #f5f7fa;
  }
  
  .select-option.is-selected {
    color: #409eff;
    font-weight: 500;
    background-color: #f0f7ff;
  }
  
  /* 滚动条样式 */
  .select-options::-webkit-scrollbar {
    width: 6px;
  }
  
  .select-options::-webkit-scrollbar-thumb {
    background-color: #c1c1c1;
    border-radius: 3px;
  }
  
  .select-options::-webkit-scrollbar-track {
    background-color: #f1f1f1;
  }
  </style>