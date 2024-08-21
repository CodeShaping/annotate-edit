export interface Task {
    id: string;
    title: string;
    description: string;
    starterCode: string;
}

export const userStudyTasks: Task[] = [
    // TASK 1
    {
        id: '1-1',
        title: 'Task 1-1',
        description: 'Sort Tasks by attribute "due_date"',
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
        description: 'Allow User to Update Task Details',
        starterCode: `from datetime import datetime

class Task:
    def __init__(self, title, description, due_date=None):
        self.title = title
        self.description = description
        self.completed = False
        self.due_date = datetime.strptime(due_date, "%Y-%m-%d") if due_date else None

    def mark_complete(self):
        self.completed = True

    def __str__(self):
        due_date_str = self.due_date.strftime("%Y-%m-%d") if self.due_date else "No due date"
        return f"Task('{self.title}', Due: {due_date_str}, Completed: {self.completed})"

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

    def list_with_priority(self):
        sorted_tasks = sorted(self.tasks, key=lambda task: task.due_date or datetime.max)
        for task in sorted_tasks:
            print(task)


if __name__ == "__main__":
    manager = TaskManager()
    manager.add_task("Buy groceries", "Milk, Bread, Eggs", "2023-05-01")
    manager.add_task("Read book", "Read 'Clean Code' book", "2023-04-25")
    manager.add_task("Pay bills", "Electricity and Internet", "2023-04-20")
    manager.add_task("Exercise", "Go for a run", None)
    print("All Tasks:")
    manager.list_tasks()
    print("Tasks with Priority:")
    manager.list_with_priority()`,
    },
    // TASK 2 
    {
        id: '2-1',
        title: 'Task 2-1',
        description: 'Implement the Manhattan Distance Metric',
        starterCode: `import numpy as np
from typing import List, Tuple

class NearestNeighborRetriever:
    def __init__(self, data: List[Tuple[float]]):
        self.data = np.array(data)
    
    def euclidean_distance(self, point1: np.ndarray, point2: np.ndarray) -> float:
        return np.sqrt(np.sum((point1 - point2) ** 2))
    
    def find_nearest_neighbors(self, query_point: Tuple[float], k: int) -> List[Tuple[float]]:
        distances = [self.euclidean_distance(np.array(query_point), point) for point in self.data]
        nearest_indices = np.argsort(distances)[:k]
        return [self.data[i] for i in nearest_indices]

# Example Usage
data_points = [(1.0, 2.0), (2.0, 3.0), (3.0, 4.0), (6.0, 7.0)]
nn_retriever = NearestNeighborRetriever(data_points)
query_point = (2.5, 3.5)
k = 2
nearest_neighbors = nn_retriever.find_nearest_neighbors(query_point, k)
print(f"Nearest neighbors to {query_point}: {nearest_neighbors}")
`,
    },
    {
        id: '2-2',
        title: 'Task 2-2',
        description: 'Support Datatype with Categorical Features',
        starterCode: `import numpy as np
from typing import List, Tuple

class NearestNeighborRetriever:
    def __init__(self, data: List[Tuple[float]]):
        self.data = np.array(data)
    
    def euclidean_distance(self, point1: np.ndarray, point2: np.ndarray) -> float:
        difference = point1 - point2
        squared_difference = difference ** 2
        sum_squared_difference = np.sum(squared_difference)
        return np.sqrt(sum_squared_difference)
    
    def manhattan_distance(self, point1: np.ndarray, point2: np.ndarray) -> float:
        absolute_difference = np.abs(point1 - point2)
        return np.sum(absolute_difference)
    
    def calculate_distances(self, query_point: np.ndarray, distance_metric: str) -> List[float]:
        if distance_metric == "euclidean":
            distances = [self.euclidean_distance(query_point, point) for point in self.data]
        elif distance_metric == "manhattan":
            distances = [self.manhattan_distance(query_point, point) for point in self.data]
        else:
            raise ValueError("Unsupported distance metric")
        return distances
    
    def find_nearest_neighbors(self, query_point: Tuple[float], k: int, distance_metric="euclidean") -> List[Tuple[float]]:
        query_array = np.array(query_point)
        distances = self.calculate_distances(query_array, distance_metric)
        nearest_indices = np.argsort(distances)[:k]
        return [self.data[i] for i in nearest_indices]

# Example Usage
data_points = [(1.0, 2.0), (2.0, 3.0), (3.0, 4.0), (6.0, 7.0)]
nn_retriever = NearestNeighborRetriever(data_points)
query_point = (2.5, 3.5)
k = 2
nearest_neighbors = nn_retriever.find_nearest_neighbors(query_point, k, distance_metric="manhattan")
print(f"Nearest neighbors to {query_point} using Manhattan distance: {nearest_neighbors}")
`,
    },
    // TASK 3
    {
        id: '3-1',
        title: 'Task 3-1',
        description: 'Impute Missing Data & Feature Engineering',
        starterCode: `import numpy as np
import pandas as pd
from typing import List, Dict

# Sample data
data = {
    'feature1': [1.0, 2.0, np.nan, 4.0, 5.0],
    'feature2': [2.0, np.nan, 3.0, 4.0, 5.0],
    'feature3': [0.1, 0.3, 1.0, 3.0, 12.0],
    'label': [0, 1, 0, 1, 1]
}
df = pd.DataFrame(data)

class DataProcessor:
    def __init__(self, dataframe: pd.DataFrame):
        self.dataframe = dataframe

    def preprocess(self) -> pd.DataFrame:
        return self.dataframe

# Example usage
processor = DataProcessor(df)
processed_df = processor.preprocess()
print(processed_df)`,
    },
    {
        id: '3-2',
        title: 'Task 3-2',
        description: 'Visualize Data Distribution',
        //         starterCode: `import numpy as np
        // import pandas as pd
        // from typing import List, Dict
        // import matplotlib.pyplot as plt
        // from sklearn.preprocessing import MinMaxScaler

        // # Sample data
        // data = {
        //     'feature1': [1.0, 2.0, np.nan, 4.0, 5.0],
        //     'feature2': [2.0, np.nan, 3.0, 4.0, 5.0],
        //     'label': [0, 1, 0, 1, 1]
        // }
        // df = pd.DataFrame(data)

        // class DataProcessor:
        //     def __init__(self, dataframe: pd.DataFrame):
        //         self.dataframe = dataframe

        //     def preprocess(self) -> pd.DataFrame:
        //         return self.dataframe

        //     def visualize_distribution(self):
        //         feature_columns = self.dataframe.columns.drop('label')
        //         for column in feature_columns:
        //             plt.figure(figsize=(6, 4))
        //             plt.hist(self.dataframe[column].dropna(), bins=10, density=True, alpha=0.6, color='g')
        //             plt.title(f'Distribution of {column}')
        //             plt.ylabel('Density')
        //             plt.xlabel(column)
        //             plt.grid(axis='y', alpha=0.75)
        //             plt.show()

        //     def scale_features(self) -> pd.DataFrame:
        //         scaler = MinMaxScaler()
        //         feature_columns = self.dataframe.columns.drop('label')
        //         self.dataframe[feature_columns] = scaler.fit_transform(self.dataframe[feature_columns])
        //         return self.dataframe

        // # Example usage
        // processor = DataProcessor(df)
        // processor.visualize_distribution()
        // processed_df = processor.scale_features()
        // print(processed_df)`,
        starterCode: `import numpy as np
import pandas as pd
from typing import List, Dict

# Sample data
data = {
    'feature1': [1.0, 2.0, np.nan, 4.0, 5.0],
    'feature2': [2.0, np.nan, 3.0, 4.0, 5.0],
    'feature3': [0.1, 0.3, 1.0, 3.0, 12.0],
    'label': [0, 1, 0, 1, 1]
}
df = pd.DataFrame(data)

class DataProcessor:
    def __init__(self, dataframe: pd.DataFrame):
        self.dataframe = dataframe

    def impute_missing_values(self) -> pd.DataFrame:
        for column in self.dataframe.columns:
            mean_value = self.dataframe[column].mean()
            self.dataframe[column].fillna(mean_value, inplace=True)
        return self.dataframe

    def create_quadratic_terms(self) -> pd.DataFrame:
        for column in self.dataframe.columns:
            self.dataframe[f'{column}_squared'] = self.dataframe[column] ** 2
        return self.dataframe

    def preprocess(self) -> pd.DataFrame:
        self.impute_missing_values()
        self.create_quadratic_terms()
        return self.dataframe

# Example usage
processor = DataProcessor(df)
processed_df = processor.preprocess()
print(processed_df)
`,
    },
];
