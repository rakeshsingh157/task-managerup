import React, { useState, useEffect } from "react";
import { db, auth } from "../DataBase/firebase";
import { collection, addDoc, onSnapshot, deleteDoc, doc, query, where, serverTimestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "../UI/collaboration.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faListCheck, faCalendarDays, faUsers, faFolderOpen } from '@fortawesome/free-solid-svg-icons';

const Collaboration = () => {
  const [newTask, setNewTask] = useState("");
  const [receiverEmail, setReceiverEmail] = useState("");
  const [collabTasks, setCollabTasks] = useState([]);
  const navigate = useNavigate();
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, "collaborationTasks"), where("receiverEmail", "==", user.email));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setCollabTasks(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [user]);

  const addCollabTask = async () => {
    if (newTask.trim() !== "" && receiverEmail.trim() !== "") {
      await addDoc(collection(db, "collaborationTasks"), {
        title: newTask,
        receiverEmail,
        status: "To Do",
        timestamp: serverTimestamp(),
      });
      setNewTask("");
      setReceiverEmail("");
    }
  };

  const deleteCollabTask = async (taskId) => {
    await deleteDoc(doc(db, "collaborationTasks", taskId));
  };

  return (
    <div className="taskBoard">
      <aside className="sidebar">
        <h2 className="sidebar-title">ƬƛƧҠƑԼƠƜ</h2>
        <ul className="sidebar-list">
          <li onClick={() => navigate("/mainpage")} className="sidebar-item">
            <FontAwesomeIcon icon={faListCheck} className="sidebar-icon" /> Task
          </li>
          <li onClick={() => navigate("/Calendar")} className="sidebar-item">
            <FontAwesomeIcon icon={faCalendarDays} className="sidebar-icon" /> Calendar
          </li>
          <li onClick={() => navigate("/Collaboration")} className="sidebar-item active">
            <FontAwesomeIcon icon={faUsers} className="sidebar-icon" /> Collaboration
          </li>
          
        </ul>
      </aside>

      <div className="collaboration-container">
        <h2>Collaboration Board</h2>
        <div className="add-collab-task">
          <input
          style={{
            width: "900px",
            padding: "12px 18px",
            border: "1px solid #ddd",
            borderRadius: "8px",
            marginRight: "15px",
            fontSize: "1.05rem",
            transition: "border-color 0.3s ease, background-color 0.3s, color 0.3s",
          }}
            type="text"
            placeholder="Task Title"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
          />
          <input style={{
              width: "400px",
              padding: "12px 18px",
              border: "1px solid #ddd",
              borderRadius: "8px",
              marginRight: "15px",
              fontSize: "1.05rem",
              transition: "border-color 0.3s ease, background-color 0.3s, color 0.3s",
            }}
            type="email"
            placeholder="Assign to (Email)"
            value={receiverEmail}
            onChange={(e) => setReceiverEmail(e.target.value)}
          />
          <button onClick={addCollabTask} style={{
              padding: "12px 25px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "1.05rem",
              transition: "background-color 0.3s ease, box-shadow 0.3s ease",
              boxShadow: "0 2px 5px rgba(0, 0, 0, 0.2)",
            }}>Add Task</button>
        </div>

        <div className="collab-task-list">
          {collabTasks.length > 0 ? (
            collabTasks.map((task) => (
              <div className="collab-task">
              <span className="task-title">{task.title}</span>
              <span className="task-email">Assigned to: {task.receiverEmail}</span>
              <span className={`task-status ${task.status.toLowerCase().replace(" ", "-")}`}>
                  Status: {task.status}
              </span>
              <button className="delete-task" onClick={() => deleteCollabTask(task.id)}>X</button>
          </div>
            ))
          ) : (
            <div className="empty-task">No collaboration tasks</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Collaboration;