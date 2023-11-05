export const enum TodoItemStatus {
    NeedsAction = "needs_action",
    Completed = "completed",
}

export interface TodoItem {
    uid: string;
    summary: string;
    status: TodoItemStatus;
}

export const enum TodoListEntityFeature {
    CREATE_TODO_ITEM = 1,
    DELETE_TODO_ITEM = 2,
    UPDATE_TODO_ITEM = 4,
    MOVE_TODO_ITEM = 8,
}

export interface TodoItems {
    items: TodoItem[];
}
