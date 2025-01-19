import { writable } from "svelte/store";
import type { StorageItemKey } from "wxt/storage";

function createStore<T>(value: T, storageKey: StorageItemKey) {
  const { subscribe, set } = writable(value);

  const storageItem = storage.defineItem<T>(storageKey, {
    fallback: value,
  });

  storageItem.getValue().then(set);

  const unwatch = storageItem.watch(set);

  return {
    subscribe,
    set: (value: T) => {
      storageItem.setValue(value);
    },
  };
}

export const someProperty = createStore(true, "local:someProperty");