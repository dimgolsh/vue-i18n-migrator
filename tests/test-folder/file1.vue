
<script setup lang="ts">
import i18n from './i18n';
defineOptions({ name: 'DateComponent', i18n });
</script>

<template>
  <div>
    <p>{{ $t('date') }}</p>
    <p>{{ $d(date, 'long') }}</p>
    <p>{{ $tc('items', count) }}</p>
  </div>
</template>
  