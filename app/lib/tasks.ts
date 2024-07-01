export interface Task {
    id: string;
    title: string;
    description: string;
    starterCode: string;
  }

export const userStudyTasks: Task[] = [
    {
        id: '1-1',
        title: 'Task 1-1',
        description: 'Add a Due Date to Tasks',
        starterCode: `class Task:
    def __init__(self, title, description):
        self.title = title
        self.description = description
        self.completed = False

    def mark_complete(self):
        self.completed = True

    def __str__(self):
        return f"Task('{self.title}', Completed: {self.completed})"


class TaskManager:
    def __init__(self):
        self.tasks = []

    def add_task(self, title, description):
        task = Task(title, description)
        self.tasks.append(task)

    def list_tasks(self):
        for task in self.tasks:
            print(task)

    def list_completed_tasks(self):
        for task in self.tasks:
            if task.completed:
                print(task)


# Example Usage
if __name__ == "__main__":
    manager = TaskManager()
    manager.add_task("Buy groceries", "Milk, Bread, Eggs")
    manager.add_task("Read book", "Read 'Clean Code' book")
    manager.list_tasks()
    manager.tasks[0].mark_complete()
    manager.list_completed_tasks()
`,
    },
    {
        id: '1-2',
        title: 'Task 1-2',
        description: 'Implement a Priority System',
        starterCode: `from datetime import datetime

class Task:
    def __init__(self, title, description, due_date=None):
        self.title = title
        self.description = description
        self.due_date = due_date
        self.completed = False

    def mark_complete(self):
        self.completed = True

    def __str__(self):
        due_date_str = self.due_date.strftime("%Y-%m-%d") if self.due_date else "No due date"
        return f"Task('{self.title}', Completed: {self.completed}, Due Date: {due_date_str})"


class TaskManager:
    def __init__(self):
        self.tasks = []

    def add_task(self, title, description, due_date=None):
        task = Task(title, description, due_date)
        self.tasks.append(task)

    def list_tasks(self):
        for task in self.tasks:
            print(task)

    def list_completed_tasks(self):
        for task in self.tasks:
            if task.completed:
                print(task)


# Example Usage
if __name__ == "__main__":
    manager = TaskManager()
    manager.add_task("Buy groceries", "Milk, Bread, Eggs", datetime(2024, 7, 1))
    manager.add_task("Read book", "Read 'Clean Code' book")
    manager.list_tasks()
    manager.tasks[0].mark_complete()
    manager.list_completed_tasks()
`,
    },
    {
        id: '1-3',
        title: 'Task 1-3',
        description: 'Add a Feature to Update Task Details',
        starterCode: `from datetime import datetime

class Task:
    def __init__(self, title, description, due_date=None, priority=1):
        self.title = title
        self.description = description
        self.due_date = due_date
        self.priority = priority
        self.completed = False

    def mark_complete(self):
        self.completed = True

    def __str__(self):
        due_date_str = self.due_date.strftime("%Y-%m-%d") if self.due_date else "No due date"
        return f"Task('{self.title}', Completed: {self.completed}, Due Date: {due_date_str}, Priority: {self.priority})"


class TaskManager:
    def __init__(self):
        self.tasks = []

    def add_task(self, title, description, due_date=None, priority=1):
        task = Task(title, description, due_date, priority)
        self.tasks.append(task)

    def list_tasks(self):
        for task in self.tasks:
            print(task)

    def list_completed_tasks(self):
        for task in self.tasks:
            if task.completed:
                print(task)

    def list_tasks_by_priority(self):
        for task in sorted(self.tasks, key=lambda x: x.priority):
            print(task)


# Example Usage
if __name__ == "__main__":
    manager = TaskManager()
    manager.add_task("Buy groceries", "Milk, Bread, Eggs", datetime(2024, 7, 1), 2)
    manager.add_task("Read book", "Read 'Clean Code' book", priority=1)
    manager.list_tasks()
    manager.tasks[0].mark_complete()
    manager.list_completed_tasks()
    print("\nTasks by Priority:")
    manager.list_tasks_by_priority()
`,
    },
    {
        id: '1-4',
        title: 'Task 1-4',
        description: 'Implement Task Deletion',
        starterCode: `from datetime import datetime

class Task:
    def __init__(self, title, description, due_date=None, priority=1):
        self.title = title
        self.description = description
        self.due_date = due_date
        self.priority = priority
        self.completed = False

    def mark_complete(self):
        self.completed = True

    def update_details(self, title=None, description=None, due_date=None, priority=None):
        if title:
            self.title = title
        if description:
            self.description = description
        if due_date:
            self.due_date = due_date
        if priority:
            self.priority = priority

    def __str__(self):
        due_date_str = self.due_date.strftime("%Y-%m-%d") if self.due_date else "No due date"
        return f"Task('{self.title}', Completed: {self.completed}, Due Date: {due_date_str}, Priority: {self.priority})"


class TaskManager:
    def __init__(self):
        self.tasks = []

    def add_task(self, title, description, due_date=None, priority=1):
        task = Task(title, description, due_date, priority)
        self.tasks.append(task)

    def list_tasks(self):
        for task in self.tasks:
            print(task)

    def list_completed_tasks(self):
        for task in self.tasks:
            if task.completed:
                print(task)

    def update_task(self, task_index, title=None, description=None, due_date=None, priority=None):
        if 0 <= task_index < len(self.tasks):
            self.tasks[task_index].update_details(title, description, due_date, priority)
        else:
            print("Invalid task index")

# Example Usage
if __name__ == "__main__":
    manager = TaskManager()
    manager.add_task("Buy groceries", "Milk, Bread, Eggs", datetime(2024, 7, 1), 2)
    manager.add_task("Read book", "Read 'Clean Code' book", priority=1)
    manager.list_tasks()
    manager.update_task(0, title="Buy weekly groceries", description="Milk, Bread, Eggs, Butter", priority=3)
    manager.list_tasks()
`,
    },
]
