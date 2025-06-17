<template>
  <template v-if="$slots.default">
    <slot name="disclaimer" />
  </template>
  <template v-else>
    <span v-bind="$attrs"> By continuing, you agree to Cedra Labs' </span>
  </template>
</template>
