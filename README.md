# Mood Cycler App for Homey Pro

Приложение создаёт виртуальное устройство "Mood Cycler", которое добавляется в комнату и позволяет переключать moods этой комнаты по кругу.

## Описание

Mood Cycler позволяет:
- Добавить виртуальное устройство в любую комнату
- Синхронизировать список moods из этой комнаты
- Переключать moods по кругу нажатием кнопки или через Flow

## Установка

1. Установите Mood Cycler app на Homey Pro
2. Перейдите в Устройства → Добавить устройство → Mood Cycler
3. Выберите комнату из списка
4. Устройство автоматически синхронизирует moods при добавлении

## Flow Cards

### Action: Sync moods
Обновляет список доступных moods для устройства.

```
WHEN: Every hour
THEN: Sync moods for [Mood Cycler - Bedroom]
```

### Action: Cycle mood
Переключает на следующий mood в списке.

```
WHEN: Pico1 button pressed
THEN: Cycle mood on [Mood Cycler - Bedroom]
```

## Fallback Setup (HomeyScript)

Если активация mood не работает напрямую (ошибка "Missing Scopes"), необходимо настроить fallback через HomeyScript.

### Шаги настройки:

1. Установите **HomeyScript** app (если не установлен)
2. Откройте HomeyScript в Homey app
3. Создайте новый скрипт
4. **Имя скрипта:** `mood-cycler-activate`
5. **Код скрипта:**

```javascript
const moodId = args[0];

if (!moodId) {
  throw new Error('Mood ID required');
}

await Homey.flow.runFlowCardAction({
  uri: `homey:mood:${moodId}`,
  id: `homey:mood:${moodId}:set`,
  args: {}
});

return `Mood ${moodId} activated`;
```

6. Сохраните скрипт

## Пример использования

После настройки, создайте два Flow:

**Flow 1 (Синхронизация):**
```
WHEN: Every hour
THEN: Sync moods for [Mood Cycler - Bedroom]
```

**Flow 2 (Переключение):**
```
WHEN: Pico1 button pressed
THEN: Cycle mood on [Mood Cycler - Bedroom]
```

**Результат:** кнопка переключает moods по кругу:
```
All lights off → High beam → Night → Pink → All lights off...
```

## Технические требования

- **Homey Pro**: >=5.0.0
- **SDK**: v3
- **Permission**: `homey:manager:api`

## Settings Page

Страница настроек показывает:
- Список всех Mood Cycler устройств
- Зона каждого устройства
- Список синхронизированных moods
- Текущий индекс (какой mood активен)
- Время последней синхронизации

## Хранение данных (Device Store)

```javascript
{
  moods: [
    { id: "xxx", name: "All lights off" },
    { id: "yyy", name: "High beam" },
    { id: "zzz", name: "Night" }
  ],
  currentIndex: 0,
  lastSync: "2026-01-04T22:00:00Z"
}
```

## API Reference

### Проверенные API вызовы:

**Получить все moods:**
```javascript
const moods = await api.moods.getMoods();
```

**Получить все zones:**
```javascript
const zones = await api.zones.getZones();
```

**Активировать mood (через Flow Card Action):**
```javascript
await api.flow.runFlowCardAction({
  uri: `homey:mood:${MOOD_ID}`,
  id: `homey:mood:${MOOD_ID}:set`,
  args: {}
});
```

## Локализация

Приложение поддерживает:
- English (en)
- Русский (ru)

## Лицензия

MIT
