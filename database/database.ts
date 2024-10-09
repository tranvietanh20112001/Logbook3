import SQLite from 'react-native-sqlite-storage';

const db = SQLite.openDatabase(
  {
    name: 'taskDB',
    location: 'default',
  },
  () => { console.log('Database opened'); },
  (error) => { console.log('Error: ', error); }
);

export const createTable = () => {
  db.transaction((tx) => {
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT, 
        name TEXT, 
        completed BOOLEAN
      )`,
      [],
      () => console.log('Table created'),
      (tx, error) => { console.log('Error creating table: ', error.message); }
    );
  });
};

export const insertTask = (name: string) => {
  db.transaction((tx) => {
    tx.executeSql(
      `INSERT INTO tasks (name, completed) VALUES (?, ?)`,
      [name, false],
      (_, result) => { console.log('Task inserted'); },
      (tx, error) => { console.log('Error inserting task: ', error.message); }
    );
  });
};

export const getTasks = (setTasks: (tasks: any) => void) => {
  db.transaction((tx) => {
    tx.executeSql(
      `SELECT * FROM tasks`,
      [],
      (_, result) => {
        const rows = result.rows.raw();
        setTasks(rows);
      },
      (tx, error) => { console.log('Error fetching tasks: ', error.message); }
    );
  });
};

export const updateTask = (id: number, name: string, completed: boolean) => {
  db.transaction((tx) => {
    tx.executeSql(
      `UPDATE tasks SET name = ?, completed = ? WHERE id = ?`,
      [name, completed, id],
      (_, result) => { console.log('Task updated'); },
      (tx, error) => { console.log('Error updating task: ', error.message); }
    );
  });
};

export const deleteTask = (id: number) => {
  db.transaction((tx) => {
    tx.executeSql(
      `DELETE FROM tasks WHERE id = ?`,
      [id],
      (_, result) => { console.log('Task deleted'); },
      (tx, error) => { console.log('Error deleting task: ', error.message); }
    );
  });
};
