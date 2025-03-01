import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../DataBase/firebase";
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from "firebase/firestore";
import "../UI/mainpage.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faListCheck, faCalendarDays, faUsers, faFolderOpen, faMoon, faSun } from "@fortawesome/free-solid-svg-icons";

const TaskBoard = () => {
    const [newTask, setNewTask] = useState("");
    const [taskDate, setTaskDate] = useState("");
    const [taskTime, setTaskTime] = useState("");
    const [tasks, setTasks] = useState({
        todo: [],
        Ongoing: [],
        completed: [],
        overdue: [],
    });

    const navigate = useNavigate();
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        const fetchTasks = async () => {
            const taskCollection = await getDocs(collection(db, "tasks"));
            const fetchedTasks = { todo: [], Ongoing: [], completed: [], overdue: [] };

            taskCollection.forEach((doc) => {
                const taskData = doc.data();
                fetchedTasks[taskData.status].push({ id: doc.id, ...taskData });
            });

            setTasks(fetchedTasks);
        };

        fetchTasks();
    }, []);

    const addTask = async () => {
        if (newTask.trim() !== "" && taskDate && taskTime) {
            const newTaskData = {
                title: newTask,
                priority: "LOW",
                timestamp: new Date(`${taskDate}T${taskTime}`),
                status: "todo",
            };

            const docRef = await addDoc(collection(db, "tasks"), newTaskData);
            setTasks((prev) => ({
                ...prev,
                todo: [...prev.todo, { id: docRef.id, ...newTaskData }],
            }));

            setNewTask("");
            setTaskDate("");
            setTaskTime("");
        }
    };

    const deleteTask = async (taskId, column) => {
        await deleteDoc(doc(db, "tasks", taskId));
        setTasks((prev) => ({
            ...prev,
            [column]: prev[column].filter((task) => task.id !== taskId),
        }));
    };

    const onDragStart = (e, task, column) => {
        e.dataTransfer.setData("task", JSON.stringify({ task, column }));
    };

    const onDrop = async (e, newColumn) => {
        e.preventDefault();
        const { task, column } = JSON.parse(e.dataTransfer.getData("task"));

        if (column !== newColumn) {
            const taskRef = doc(db, "tasks", task.id);
            await updateDoc(taskRef, { status: newColumn });

            setTasks((prev) => {
                const updatedTasks = { ...prev };
                updatedTasks[column] = updatedTasks[column].filter((t) => t.id !== task.id);
                updatedTasks[newColumn] = [...updatedTasks[newColumn], { ...task, status: newColumn }];
                return updatedTasks;
            });
        }
    };

    const toggleDarkMode = () => {
        setIsDarkMode(!isDarkMode);
    };

    return (
        <div className={`taskBoard ${isDarkMode ? "dark-mode" : ""}`}>
            <aside className="sidebar">
                <h2 className="sidebar-title">ƬƛƧҠƑԼƠƜ</h2>
                <ul className="sidebar-list">
                    <li onClick={() => navigate("/mainpage")} className="sidebar-item active">
                        <FontAwesomeIcon icon={faListCheck} className="sidebar-icon" /> Task
                    </li>
                    <li onClick={() => navigate("/Calendar")} className="sidebar-item">
                        <FontAwesomeIcon icon={faCalendarDays} className="sidebar-icon" /> Calendar
                    </li>
                    <li onClick={() => navigate("/Collaboration")} className="sidebar-item">
                        <FontAwesomeIcon icon={faUsers} className="sidebar-icon" /> Collaboration
                    </li>
                </ul>
            </aside>

            <main className="main">
                <header>
                    <h1>Task Management Board</h1>
                    <div className="Add-task">
                        <input type="text" placeholder="Add task" value={newTask} onChange={(e) => setNewTask(e.target.value)} />
                        <input type="date" value={taskDate} onChange={(e) => setTaskDate(e.target.value)} />
                        <input type="time" value={taskTime} onChange={(e) => setTaskTime(e.target.value)} />
                        <button onClick={addTask}>Add Task</button>
                    </div>
                </header>

                <section className="task-container">
                    {Object.keys(tasks).map((column) => (
                        <div key={column} className={"task-column " + column} onDragOver={(e) => e.preventDefault()} onDrop={(e) => onDrop(e, column)}>
                            <h3>{column.toUpperCase()}</h3>
                            {tasks[column].length > 0 ? (
                                tasks[column].map((task, index) => (
                                    <div key={task.id || index} className="task" draggable onDragStart={(e) => onDragStart(e, task, column)}>
                                        <div className="task-title">{task.title}</div>
                                        <div className="task-priority">{task.priority}</div>
                                        <div className="task-timestamp">
                                            {task.timestamp ? (
                                                task.timestamp.toDate ? (
                                                    new Date(task.timestamp.toDate()).toLocaleString()
                                                ) : (
                                                    new Date(task.timestamp).toLocaleString()
                                                )
                                            ) : (
                                                "No Date"
                                            )}
                                        </div>
                                        <button className="delete-task" onClick={() => deleteTask(task.id, column)}>❌</button>
                                    </div>
                                ))
                            ) : (
                                <div className="task empty-task">No tasks</div>
                            )}
                        </div>
                    ))}
                </section>
            </main>
        </div>
    );
};

export default TaskBoard;