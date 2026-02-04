import React, { useEffect, useState } from "react";
import { FaPlus, FaTrash } from "react-icons/fa";

const API_URL = process.env.REACT_APP_API_URL;

export default function TeamTodo({ teamTaskId }) {
  const [subtasks, setSubtasks] = useState([]);
  const [newTitle, setNewTitle] = useState("");
  const [newAssignee, setNewAssignee] = useState("");
  const [newDate, setNewDate] = useState("");

  //Mock data 
  useEffect(() => {
    setSubtasks([
      { id: 1, title: "fesssssssssss", assignee: "affff", done: 0, target_date: "2026-02-06T18:00" },
      { id: 2, title: "aeeeeeeeeef", assignee: "hthtb", done: 2, target_date: "2026-02-08T12:00" },
      { id: 3, title: "aefafaef", assignee: "Chrffag", done: 1, target_date: "2026-02-10T09:00" },
    ]);
  }, []);

  // Backend
  /*
  useEffect(() => {
    fetch(`${API_URL}/team-tasks/${teamTaskId}`)
      .then(res => res.json())
      .then(data => setSubtasks(data))
      .catch(err => console.error(err));
  }, [teamTaskId]);
  */

  const totalTasks = subtasks.length;
  const doneTasks = subtasks.filter(t => t.done === 1).length;
  const progress = totalTasks === 0 ? 0 : Math.round((doneTasks / totalTasks) * 100);

  const getNextStatus = (current) => {
    if (current === 0) return 2;
    if (current === 2) return 1;
    return 1;
  };

  const toggleStatus = async (id, current) => {
    const next = getNextStatus(current);

    setSubtasks(subtasks.map(t =>
      t.id === id ? { ...t, done: next } : t
    ));

    /*
    await fetch(`${API_URL}/team-subtasks/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ done: next })
    });
    */
  };

  const addTask = async () => {
    if (!newTitle.trim() || !newAssignee.trim()) return;

    const newTask = {
      id: Date.now(),
      title: newTitle,
      assignee: newAssignee,
      done: 0,
      target_date: newDate || null,
    };

    setSubtasks([newTask, ...subtasks]);
    setNewTitle("");
    setNewAssignee("");
    setNewDate("");
    /*
    await fetch(`${API_URL}/team-subtasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        teamTaskId,
        title: newTitle,
        assignee: newAssignee,
        target_date: newDate || null
      })
    });
    */
  };

  const deleteTask = async (id) => {
    setSubtasks(subtasks.filter(t => t.id !== id));

    /*
    await fetch(`${API_URL}/team-subtasks/${id}`, {
      method: "DELETE"
    });
    */
  };

  const statusBadge = (done) => {
    if (done === 0) return "bg-gray-100 text-gray-500";
    if (done === 2) return "bg-yellow-100 text-yellow-600";
    return "bg-green-100 text-green-600";
  };

  const statusText = (done) => {
    if (done === 0) return "📝 Todo";
    if (done === 2) return "⏳ Doing";
    return "✅ Done";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-blue-100 p-8">
      <div className="max-w-3xl mx-auto">
        
        {/* Header Card */}
        <div className="mb-6 p-6 rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xl">
          <h1 className="text-2xl font-bold">Team Jeffrey</h1>
          <p className="text-sm opacity-80">NGAN RAI</p>

          {/* Progress */}
          <div className="mt-4">
            <div className="flex justify-between text-xs mb-1">
              <span>Progress</span>
              <span>{doneTasks}/{totalTasks} Done</span>
            </div>
            <div className="w-full h-2 bg-white/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-400 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Add Task Card */}
        <div className="mb-6 p-5 rounded-3xl bg-white shadow-lg border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <input
              type="text"
              placeholder="Task title..."
              className="px-4 py-2 rounded-xl border focus:ring-2 focus:ring-blue-400"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
            />

            <input
              type="text"
              placeholder="Assign to..."
              className="px-4 py-2 rounded-xl border focus:ring-2 focus:ring-blue-400"
              value={newAssignee}
              onChange={(e) => setNewAssignee(e.target.value)}
            />

            <input
              type="datetime-local"
              className="px-4 py-2 rounded-xl border focus:ring-2 focus:ring-blue-400"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
            />

            <button
              onClick={addTask}
              className="px-5 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 flex items-center justify-center gap-2"
            >
              <FaPlus /> Add
            </button>
          </div>
        </div>

        {/* Task Cards */}
        <div className="space-y-4">
          {subtasks.map(task => (
            <div
              key={task.id}
              className="p-5 rounded-3xl bg-white shadow-md border hover:shadow-xl transition-all"
            >
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h3 className={`font-semibold text-lg ${task.done === 1 ? "line-through text-gray-400" : ""}`}>
                    {task.title}
                  </h3>

                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-600 text-xs">
                      👤 {task.assignee}
                    </span>

                    {task.target_date && (
                      <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs">
                        ⏰ {new Date(task.target_date).toLocaleString()}
                      </span>
                    )}

                    <span className={`px-3 py-1 rounded-full text-xs ${statusBadge(task.done)}`}>
                      {statusText(task.done)}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => toggleStatus(task.id, task.done)}
                    className="px-3 py-1 rounded-lg text-sm bg-indigo-500 text-white hover:bg-indigo-600"
                  >
                    Next
                  </button>

                  <button
                    onClick={() => deleteTask(task.id)}
                    className="px-3 py-1 rounded-lg text-sm bg-red-500 text-white hover:bg-red-600"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {subtasks.length === 0 && (
            <div className="text-center text-gray-400 mt-10">
              No team tasks yet. Add one above ✨
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
