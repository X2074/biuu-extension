import { ref } from 'vue';
import { store } from "./EIP6963Provider.ts";

export const useSyncProviders = () => {
  // const providers = ref(store.value());
  const providers = ref<EIP6963ProviderDetail[]>([])
  console.log(providers.value, 'providers.value');
  const unsubscribe = store.subscribe(() => {
    providers.value = store.value();
  });

  return {
    providers,
    unsubscribe
  };
}

//export const useSyncProviders = ()=> useSyncExternalStore(store.subscribe, store.value, store.value)