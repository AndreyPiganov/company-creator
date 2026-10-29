const stages: Record<string, string> = {
  queued: "В очереди", preparing: "Подготовка", requesting: "Создаём содержание",
  validating: "Проверяем карточку", retrying: "Повторная попытка", saving: "Сохраняем результат",
  rendering: "Собираем страницы", complete: "Готово", failed: "Не удалось завершить",
};

export function jobStage(state: string): string { return stages[state] ?? "Обработка"; }
