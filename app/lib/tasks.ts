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
    {
        id: '2-1',
        title: 'Task 2-1',
        description: 'Add a Function to Normalize Prices',
        starterCode: `from typing import List, Dict

# Sample data
sales_data = [
    {"item": "apple", "quantity": 10, "price_per_unit": 0.5},
    {"item": "banana", "quantity": 5, "price_per_unit": 0.2},
    {"item": "cherry", "quantity": 20, "price_per_unit": 1.5},
]

def filter_data(data: List[Dict], min_quantity: int) -> List[Dict]:
    return [item for item in data if item["quantity"] >= min_quantity]

def transform_data(data: List[Dict]) -> List[Dict]:
    for item in data:
        item["total_price"] = item["quantity"] * item["price_per_unit"]
    return data

def summarize_data(data: List[Dict]) -> Dict:
    total_quantity = sum(item["quantity"] for item in data)
    total_sales = sum(item["total_price"] for item in data)
    return {"total_quantity": total_quantity, "total_sales": total_sales}

# Example usage
filtered_data = filter_data(sales_data, 10)
transformed_data = transform_data(filtered_data)
summary = summarize_data(transformed_data)

print("Filtered Data:", filtered_data)
print("Transformed Data:", transformed_data)
print("Summary:", summary)
`,
    },
    {
        id: '2-2',
        title: 'Task 2-2',
        description: 'Add a Function to Calculate Discounts',
        starterCode: `from typing import List, Dict

# Sample data
sales_data = [
    {"item": "apple", "quantity": 10, "price_per_unit": 0.5},
    {"item": "banana", "quantity": 5, "price_per_unit": 0.2},
    {"item": "cherry", "quantity": 20, "price_per_unit": 1.5},
]

def filter_data(data: List[Dict], min_quantity: int) -> List[Dict]:
    return [item for item in data if item["quantity"] >= min_quantity]

def normalize_prices(data: List[Dict]) -> List[Dict]:
    max_price = max(item["price_per_unit"] for item in data)
    for item in data:
        item["price_per_unit"] /= max_price
    return data

def transform_data(data: List[Dict]) -> List[Dict]:
    for item in data:
        item["total_price"] = item["quantity"] * item["price_per_unit"]
    return data

def summarize_data(data: List[Dict]) -> Dict:
    total_quantity = sum(item["quantity"] for item in data)
    total_sales = sum(item["total_price"] for item in data)
    return {"total_quantity": total_quantity, "total_sales": total_sales}

# Example usage
filtered_data = filter_data(sales_data, 10)
normalized_data = normalize_prices(filtered_data)
transformed_data = transform_data(normalized_data)
summary = summarize_data(transformed_data)

print("Filtered Data:", filtered_data)
print("Normalized Data:", normalized_data)
print("Transformed Data:", transformed_data)
print("Summary:", summary)
`,
    },
    {
        id: '2-3',
        title: 'Task 2-3',
        description: 'Add a Function to Group Data by Item',
        starterCode: `from typing import List, Dict

# Sample data
sales_data = [
    {"item": "apple", "quantity": 10, "price_per_unit": 0.5},
    {"item": "banana", "quantity": 5, "price_per_unit": 0.2},
    {"item": "cherry", "quantity": 20, "price_per_unit": 1.5},
]

def filter_data(data: List[Dict], min_quantity: int) -> List[Dict]:
    return [item for item in data if item["quantity"] >= min_quantity]

def normalize_prices(data: List[Dict]) -> List[Dict]:
    max_price = max(item["price_per_unit"] for item in data)
    for item in data:
        item["price_per_unit"] /= max_price
    return data

def apply_discount(data: List[Dict], discount_rate: float) -> List[Dict]:
    for item in data:
        item["price_per_unit"] *= (1 - discount_rate)
    return data

def transform_data(data: List[Dict]) -> List[Dict]:
    for item in data:
        item["total_price"] = item["quantity"] * item["price_per_unit"]
    return data

def summarize_data(data: List[Dict]) -> Dict:
    total_quantity = sum(item["quantity"] for item in data)
    total_sales = sum(item["total_price"] for item in data)
    return {"total_quantity": total_quantity, "total_sales": total_sales}

# Example usage
filtered_data = filter_data(sales_data, 10)
normalized_data = normalize_prices(filtered_data)
discounted_data = apply_discount(normalized_data, 0.1)
transformed_data = transform_data(discounted_data)
summary = summarize_data(transformed_data)

print("Filtered Data:", filtered_data)
print("Normalized Data:", normalized_data)
print("Discounted Data:", discounted_data)
print("Transformed Data:", transformed_data)
print("Summary:", summary)
`,
    },
    {
        id: '2-4',
        title: 'Task 2-4',
        description: 'Add a Function to Export Data to JSON',
        starterCode: `from typing import List, Dict
from collections import defaultdict

# Sample data
sales_data = [
    {"item": "apple", "quantity": 10, "price_per_unit": 0.5},
    {"item": "banana", "quantity": 5, "price_per_unit": 0.2},
    {"item": "cherry", "quantity": 20, "price_per_unit": 1.5},
]

def filter_data(data: List[Dict], min_quantity: int) -> List[Dict]:
    return [item for item in data if item["quantity"] >= min_quantity]

def normalize_prices(data: List[Dict]) -> List[Dict]:
    max_price = max(item["price_per_unit"] for item in data)
    for item in data:
        item["price_per_unit"] /= max_price
    return data

def apply_discount(data: List[Dict], discount_rate: float) -> List[Dict]:
    for item in data:
        item["price_per_unit"] *= (1 - discount_rate)
    return data

def transform_data(data: List[Dict]) -> List[Dict]:
    for item in data:
        item["total_price"] = item["quantity"] * item["price_per_unit"]
    return data

def group_by_item(data: List[Dict]) -> List[Dict]:
    grouped_data = defaultdict(lambda: {"quantity": 0, "total_price": 0})
    for item in data:
        grouped_data[item["item"]]["quantity"] += item["quantity"]
        grouped_data[item["item"]]["total_price"] += item["total_price"]
    return [{"item": item, "quantity": details["quantity"], "total_price": details["total_price"]}
            for item, details in grouped_data.items()]

def summarize_data(data: List[Dict]) -> Dict:
    total_quantity = sum(item["quantity"] for item in data)
    total_sales = sum(item["total_price"] for item in data)
    return {"total_quantity": total_quantity, "total_sales": total_sales}

# Example usage
filtered_data = filter_data(sales_data, 10)
normalized_data = normalize_prices(filtered_data)
discounted_data = apply_discount(normalized_data, 0.1)
transformed_data = transform_data(discounted_data)
grouped_data = group_by_item(transformed_data)
summary = summarize_data(grouped_data)

print("Filtered Data:", filtered_data)
print("Normalized Data:", normalized_data)
print("Discounted Data:", discounted_data)
print("Transformed Data:", transformed_data)
print("Grouped Data:", grouped_data)
print("Summary:", summary)
`,
    },
];
