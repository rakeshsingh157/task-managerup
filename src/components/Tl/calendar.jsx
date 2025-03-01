import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../DataBase/firebase";
import { collection, getDocs, onSnapshot } from "firebase/firestore";
import "../UI/calendar.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faListCheck, faCalendarDays, faUsers, faFolderOpen } from "@fortawesome/free-solid-svg-icons";

const Calendar = () => {
    const navigate = useNavigate();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [darkMode, setDarkMode] = useState(false);
    const [tasks, setTasks] = useState([]);

    const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = (getFirstDayOfMonth(year, month) + 6) % 7;

    const daysArray = Array(firstDay).fill(null).concat([...Array(daysInMonth).keys()].map(day => day + 1));

    const handlePrevMonth = () => {
        setCurrentDate(new Date(year, month - 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(year, month + 1));
    };

    const toggleDarkMode = () => {
        setDarkMode(!darkMode);
    };

    useEffect(() => {
        const fetchTasks = () => {
            const taskCollection = collection(db, "tasks");
            const unsubscribe = onSnapshot(taskCollection, (snapshot) => {
                const fetchedTasks = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setTasks(fetchedTasks);
            });
            return () => unsubscribe();
        };

        fetchTasks();
    }, []);

    const getTasksForDay = (day) => {
        const selectedDate = new Date(year, month, day);
        const nextDay = new Date(year, month, day + 1);

        return tasks.filter((task) => {
            const taskDate = task.timestamp.toDate ? task.timestamp.toDate() : new Date(task.timestamp);
            return taskDate >= selectedDate && taskDate < nextDay;
        });
    };

    return (
        <div className={`calendar-page ${darkMode ? "dark-mode" : ""}`}>
            <aside className="sidebar">
                <h2 className="sidebar-title">ƬƛƧҠƑԼƠƜ</h2>
                <ul className="sidebar-list">
                    <li onClick={() => navigate("/mainpage")} className="sidebar-item">
                        <FontAwesomeIcon icon={faListCheck} className="sidebar-icon" /> Task
                    </li>
                    <li onClick={() => navigate("/Calendar")} className="sidebar-item active">
                        <FontAwesomeIcon icon={faCalendarDays} className="sidebar-icon" /> Calendar
                    </li>
                    <li onClick={() => navigate("/Collaboration")} className="sidebar-item">
                        <FontAwesomeIcon icon={faUsers} className="sidebar-icon" /> Collaboration
                    </li>
                </ul>
            </aside>

            <div className="calendar-content">
                <div className="container">
                    <div className="header">
                        <button onClick={handlePrevMonth} className="calendar-nav-button">Prev</button>
                        <h1 className="calendar-title">{currentDate.toLocaleString('default', { month: 'long' })} {year}</h1>
                        <button onClick={handleNextMonth} className="calendar-nav-button">Next</button>
                    </div>
                    <div className="grid days">
                        {daysOfWeek.map(day => <div key={day} className="day-header">{day}</div>)}
                    </div>
                    <div className="grid">
                        {daysArray.map((day, index) => (
                            <div key={index} className="day">
                                {day && <span className="day-number">{day}</span>}
                                {day && getTasksForDay(day).map((task) => (
                                    <div key={task.id} className="task-event">
                                        {task.title}
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Calendar;