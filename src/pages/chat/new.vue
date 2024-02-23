<template>
  <div class="p-8 box-border">
    <u-breadcrumb
      divider="/"
      :links="[{ label: 'Home', to: '/' }, { label: 'New Chat' }]"
    />
  </div>
  <div class="grid max-w-[560px] mx-auto p-8">
    <u-form
      :schema="schema"
      :state="state"
      class="space-y-4"
      @submit="onSubmit"
    >
      <h1>New Chat</h1>
      <u-form-group label="Name" name="name">
        <u-input v-model.trim="state.name" />
      </u-form-group>
      <u-form-group label="Address" name="address">
        <u-input v-model.trim="state.address" />
      </u-form-group>
      <u-form-group label="Port" name="port">
        <u-input v-model.number="state.port" />
      </u-form-group>
      <div class="w-full grid items-end">
        <u-button type="submit" class="ml-auto mr-0"> Create Chat </u-button>
      </div>
    </u-form>
  </div>
</template>

<script lang="ts" setup>
import { object, string, type InferType, number } from "yup";
import type { FormSubmitEvent } from "#ui/types";

const { $ws, $me } = useNuxtApp();
const schema = object({
  name: string().required("Required"),
  address: string()
    .test({
      name: "address",
      message: "Invalid address",
      test: (value) =>
        /^(2(?:2[4-9]|3[0-9]))\.([0-2]?[0-9]?[0-9])\.([0-2]?[0-9]?[0-9])\.([0-2]?[0-9]?[0-9])$/g.test(
          value
        ),
    })
    .required("Required"),
  port: number()
    .test({
      name: "port",
      message: "Invalid port",
      test: (value) =>
        typeof value === "number" && value >= 1029 && value <= 48657,
    })
    .required("Required"),
});
const state = reactive({
  name: undefined,
  address: undefined,
  port: undefined,
});

async function onSubmit(event: FormSubmitEvent<InferType<typeof schema>>) {
  $ws.value.send(
    JSON.stringify({
      type: "room",
      ...event.data,
      user_id: $me.value?.id,
      user_ids: "[]",
    })
  );

  await navigateTo("/");
}
</script>
