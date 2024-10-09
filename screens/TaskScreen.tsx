import React, {useState, useEffect} from 'react';
import {View, FlatList, StyleSheet} from 'react-native';
import {TextInput, Button} from 'react-native-paper';
import TaskItem from '../components/TaskItem';
import {
  createTable,
  getTasks,
  insertTask,
  updateTask,
  deleteTask,
} from '../database/database';

const TaskScreen: React.FC = () => {
  const [taskName, setTaskName] = useState('');
  const [tasks, setTasks] = useState<
    {id: number; name: string; completed: boolean}[]
  >([]);

  useEffect(() => {
    createTable();
    loadTasks();
  }, []);

  const loadTasks = () => {
    getTasks(setTasks);
  };

  const handleAddTask = () => {
    if (taskName) {
      insertTask(taskName);
      setTaskName('');
      loadTasks();
    }
  };

  const handleToggleComplete = (id: number, completed: boolean) => {
    const task = tasks.find(task => task.id === id);
    if (task) {
      updateTask(id, task.name, !completed);
      loadTasks();
    }
  };

  const handleEditTask = (id: number, newName: string) => {
    const task = tasks.find(task => task.id === id);
    if (task) {
      updateTask(id, newName, task.completed);
      loadTasks();
    }
  };

  const handleDeleteTask = (id: number) => {
    deleteTask(id);
    loadTasks();
  };

  return (
    <View style={styles.container}>
      <TextInput
        label="Task Name"
        value={taskName}
        onChangeText={setTaskName}
        style={styles.input}
      />
      <Button mode="contained" onPress={handleAddTask} style={styles.button}>
        Add Task
      </Button>

      <FlatList
        data={tasks}
        renderItem={({item}) => (
          <TaskItem
            id={item.id}
            name={item.name}
            completed={item.completed}
            onToggleComplete={handleToggleComplete}
            onDeleteTask={handleDeleteTask}
            onEditTask={handleEditTask}
          />
        )}
        keyExtractor={item => item.id.toString()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginBottom: 16,
  },
});

export default TaskScreen;
