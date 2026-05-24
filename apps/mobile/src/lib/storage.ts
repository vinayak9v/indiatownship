import AsyncStorage from '@react-native-async-storage/async-storage';

const SAVED_KEY = 'it_saved_property_ids';

export async function getLocalSavedIds(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(SAVED_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export async function setLocalSavedIds(ids: string[]): Promise<void> {
  await AsyncStorage.setItem(SAVED_KEY, JSON.stringify(ids));
}

export async function addLocalSavedId(id: string): Promise<void> {
  const ids = await getLocalSavedIds();
  if (!ids.includes(id)) {
    await setLocalSavedIds([...ids, id]);
  }
}

export async function removeLocalSavedId(id: string): Promise<void> {
  const ids = await getLocalSavedIds();
  await setLocalSavedIds(ids.filter((i) => i !== id));
}
