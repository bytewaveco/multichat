<template>
  <div class="p-8 box-border">
    <u-breadcrumb
      divider="/"
      :links="[{ label: 'Home', to: '/' }, { label: 'Profile' }]"
    />
  </div>
  <div class="grid max-w-[560px] mx-auto p-8">
    <u-form
      :schema="schema"
      :state="state"
      class="space-y-4"
      @submit="onSubmit"
    >
      <h1>Profile</h1>
      <u-form-group label="Username" name="username">
        <u-input v-model.trim="state.username" />
      </u-form-group>
      <div class="w-full grid items-end">
        <u-button type="submit" class="ml-auto mr-0"> Update Profile </u-button>
      </div>
    </u-form>
  </div>
</template>

<script lang="ts" setup>
import { object, string, type InferType } from "yup";
import type { FormSubmitEvent } from "#ui/types";

const { $ws, $me } = useNuxtApp();
const schema = object({
  username: string().required("Required"),
});
const state = reactive({
  username: $me.value?.username ?? "",
});

async function onSubmit(event: FormSubmitEvent<InferType<typeof schema>>) {
  $ws.value.send(
    JSON.stringify({
      type: "me:update",
      ...event.data,
    })
  );

  await navigateTo("/");
}
</script>
